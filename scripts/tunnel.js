const localtunnel = require('localtunnel');

let currentTunnel = null;

async function startTunnel() {
  try {
    const tunnel = await localtunnel({ port: 3000, subdomain: 'cafenova-' + Math.floor(1000 + Math.random() * 9000) });
    currentTunnel = tunnel;
    console.log('====================================');
    console.log('LIVE_HTTPS_URL: ' + tunnel.url);
    console.log('====================================');

    tunnel.on('close', () => {
      console.log('Tunnel connection closed. Reconnecting in 3 seconds...');
      setTimeout(startTunnel, 3000);
    });

    tunnel.on('error', (err) => {
      console.error('Tunnel encountered error:', err.message);
      try { tunnel.close(); } catch (_) {}
      setTimeout(startTunnel, 3000);
    });
  } catch (err) {
    console.error('Failed to start tunnel:', err.message);
    setTimeout(startTunnel, 3000);
  }
}

// Keep the event loop alive
setInterval(() => {}, 1 << 30);

startTunnel();
