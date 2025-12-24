// Network module: IP refresh, client detection

function detectClientInfo() {
  const ua = navigator.userAgent;
  let os = 'Unknown';
  let browser = 'Unknown';

  // Detect OS
  if (ua.includes('Windows NT 10')) os = 'Windows 10/11';
  else if (ua.includes('Windows NT 6.3')) os = 'Windows 8.1';
  else if (ua.includes('Windows NT 6.2')) os = 'Windows 8';
  else if (ua.includes('Windows NT 6.1')) os = 'Windows 7';
  else if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac OS X')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

  // Detect Browser
  if (ua.includes('Firefox/')) browser = 'Firefox';
  else if (ua.includes('Edg/')) browser = 'Edge';
  else if (ua.includes('Chrome/')) browser = 'Chrome';
  else if (ua.includes('Safari/') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Opera') || ua.includes('OPR/')) browser = 'Opera';

  // Get timezone
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown';

  return { os, browser, timezone };
}

async function refreshIP() {
  try {
    const summaryRes = await fetch("/api/summary", {cache:"no-store"});
    const summary = await summaryRes.json();
    const isLocal = summary.client && summary.client.isLocal;

    const res = await fetch("/api/ip", {cache:"no-store"});
    const j = await res.json();

    // Update label based on whether it's local or remote
    const lanIpLabel = document.getElementById("lanIpLabel");
    const networkNote = document.getElementById("networkNote");
    if (lanIpLabel) {
      if (isLocal) {
        lanIpLabel.textContent = "LAN IPs";
        if (networkNote) networkNote.textContent = "";
      } else {
        lanIpLabel.textContent = "Client IP";
        if (networkNote) networkNote.textContent = "Note: Showing client's IP. Server LAN IPs are not shown when accessed remotely.";
      }
    }

    // Display LAN IPs with PTR records
    const lanIpsEl = document.getElementById("lanIps");
    const lanPtrEl = document.getElementById("lanPtr");
    if (j.network && j.network.hostIps && j.network.hostIps.length > 0) {
      const ips = j.network.hostIps.map(ipInfo => ipInfo.ip);
      const ptrs = j.network.hostIps.map(ipInfo => ipInfo.ptr).filter(p => p);
      if (lanIpsEl) lanIpsEl.textContent = ips.join(", ");
      if (lanPtrEl) lanPtrEl.textContent = ptrs.length > 0 ? ptrs.join(", ") : "";
    } else {
      if (lanIpsEl) lanIpsEl.textContent = "—";
      if (lanPtrEl) lanPtrEl.textContent = "";
    }

    // Display Public IP with PTR
    if (j.public && j.public.ip) {
      document.getElementById("pubIp").textContent = j.public.ip;
      document.getElementById("pubPtr").textContent = j.public.ptr || "";
      document.getElementById("pubIpErr").textContent = "";
    } else {
      document.getElementById("pubIp").textContent = "—";
      document.getElementById("pubPtr").textContent = "";
      document.getElementById("pubIpErr").textContent = (j.public && j.public.error) || "";
    }

    window.startTimer("ip");
  } catch(err) {
    console.error("Error refreshing IP:", err);
  }
}

// Track offline state for retry mechanism
let isOffline = false;
let retryInterval = null;

async function refresh() {
  const statusTextEl = document.getElementById("statusText");
  const pulseEl = document.querySelector(".pulse");
  
  try {
    // Use fetchWithTimeout if available, otherwise use regular fetch
    let res;
    if (window.fetchWithTimeout) {
      res = await window.fetchWithTimeout("/api/summary", {cache:"no-store"}, 3000);
    } else {
      // Fallback: use AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      try {
        res = await fetch("/api/summary", {cache:"no-store", signal: controller.signal});
        clearTimeout(timeoutId);
      } catch (err) {
        clearTimeout(timeoutId);
        throw err;
      }
    }
    
    // Check if response is successful
    if (!res.ok) {
      // Server returned an error status
      setOfflineStatus(statusTextEl, pulseEl);
      console.error("Server returned error status:", res.status);
      startRetryMechanism();
      return;
    }

    const j = await res.json();

    const isLocal = j.client && j.client.isLocal;

    const statusTitle = document.getElementById("statusTitle");
    const serverInfoDiv = document.getElementById("serverInfo");
    const clientInfoDiv = document.getElementById("clientInfo");

    // Set status to Online on successful API call
    setOnlineStatus(statusTextEl, pulseEl);
    stopRetryMechanism();

    if (isLocal) {
      if (statusTitle) statusTitle.textContent = "Status";
      if (serverInfoDiv) serverInfoDiv.style.display = "block";
      if (clientInfoDiv) clientInfoDiv.style.display = "none";

      document.getElementById("host").textContent = j.server.hostname;
      document.getElementById("uptime").textContent = window.fmtUptime(j.server.uptimeSec);
      document.getElementById("time").textContent = j.server.time;

      // Convert server time to UTC
      if (j.server.time) {
        try {
          const serverTime = new Date(j.server.time);
          const utcTime = serverTime.toISOString();
          document.getElementById("utcTime").textContent = utcTime;
        } catch(e) {
          document.getElementById("utcTime").textContent = "—";
        }
      } else {
        document.getElementById("utcTime").textContent = "—";
      }
    } else {
      if (statusTitle) statusTitle.textContent = "Client Status";
      if (serverInfoDiv) serverInfoDiv.style.display = "none";
      if (clientInfoDiv) clientInfoDiv.style.display = "block";

      if (j.client) {
        const clientIPEl = document.getElementById("clientIP");
        const clientHostnameEl = document.getElementById("clientHostname");
        if (clientIPEl) clientIPEl.textContent = j.client.ip || "—";
        if (clientHostnameEl) clientHostnameEl.textContent = j.client.hostname || "—";
      }

      const client = detectClientInfo();
      const clientOSEl = document.getElementById("clientOS");
      const clientBrowserEl = document.getElementById("clientBrowser");
      const clientTimezoneEl = document.getElementById("clientTimezone");
      if (clientOSEl) clientOSEl.textContent = client.os;
      if (clientBrowserEl) clientBrowserEl.textContent = client.browser;
      if (clientTimezoneEl) clientTimezoneEl.textContent = client.timezone;
    }

    document.getElementById("subtitle").textContent =
      j.server.os + "/" + j.server.arch + " • " + j.server.goVersion;

  } catch(err) {
    // Network error, timeout, or fetch failed (server is down/unreachable)
    setOfflineStatus(statusTextEl, pulseEl);
    if (err.name === 'AbortError') {
      console.error("Request timed out - server is likely down");
    } else {
      console.error("Error fetching status:", err);
    }
    startRetryMechanism();
  }
}

function setOfflineStatus(statusTextEl, pulseEl) {
  isOffline = true;
  if (statusTextEl) statusTextEl.textContent = "Offline";
  if (pulseEl) {
    pulseEl.style.background = "var(--bad, #ef4444)";
    pulseEl.style.boxShadow = "0 0 0 0 rgba(239, 68, 68, 0.7)";
  }
}

function setOnlineStatus(statusTextEl, pulseEl) {
  isOffline = false;
  if (statusTextEl) statusTextEl.textContent = "Online";
  if (pulseEl) {
    pulseEl.style.background = "";
    pulseEl.style.boxShadow = "";
  }
}

function startRetryMechanism() {
  // If already retrying, don't start another interval
  if (retryInterval) return;
  
  // Retry every 5 seconds when offline
  retryInterval = setInterval(() => {
    if (isOffline) {
      console.log("Retrying connection to server...");
      refresh();
    }
  }, 5000);
}

function stopRetryMechanism() {
  if (retryInterval) {
    clearInterval(retryInterval);
    retryInterval = null;
  }
}

// Export to window
window.detectClientInfo = detectClientInfo;
window.refreshIP = refreshIP;
window.refresh = refresh;
