const os = require('os');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const constantsFilePath = path.join(__dirname, '..', 'constants', 'api.ts');

const getLocalIpAddress = () => {
  try {
    // Try to get the host machine's IP address
    if (process.env.DOCKER_HOST) {
      // If running in Docker, try to get the host's IP
      const hostIp = process.env.DOCKER_HOST.replace('tcp://', '').split(':')[0];
      if (hostIp) return hostIp;
    }

    // Fallback to checking network interfaces
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      const ifaceGroup = interfaces[name];
      if (ifaceGroup) {
        for (const iface of ifaceGroup) {
          // Skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
          if (iface.family === 'IPv4' && !iface.internal) {
            // Prefer addresses that start with 192.168. or 10.
            if (iface.address.startsWith('192.168.') || iface.address.startsWith('10.')) {
              return iface.address;
            }
          }
        }
      }
    }

    // If no preferred address found, return the first non-internal IPv4 address
    for (const name of Object.keys(interfaces)) {
      const ifaceGroup = interfaces[name];
      if (ifaceGroup) {
        for (const iface of ifaceGroup) {
          if (iface.family === 'IPv4' && !iface.internal) {
            return iface.address;
          }
        }
      }
    }

    // If still no IP found, try using the default gateway
    try {
      const defaultGateway = execSync('ip route | grep default | awk \'{print $3}\'').toString().trim();
      if (defaultGateway) return defaultGateway;
    } catch (e) {
      console.warn('Could not get default gateway:', e.message);
    }

    return null;
  } catch (error) {
    console.error('Error getting IP address:', error);
    return null;
  }
};

const ip = getLocalIpAddress();

if (!ip) {
  console.error("Could not find a local IP address. Please set it manually.");
  process.exit(1);
}

console.log(`Found local IP address: ${ip}`);

try {
  let content = fs.readFileSync(constantsFilePath, 'utf8');
  const oldUrl = content.match(/http:\/\/[0-9\.]+:8000/);
  
  if (oldUrl && oldUrl[0].includes(ip)) {
    console.log("API_BASE_URL is already up to date.");
  } else {
    const newContent = content.replace(/http:\/\/[0-9\.]+:8000/g, `http://${ip}:8000`);
    fs.writeFileSync(constantsFilePath, newContent, 'utf8');
    console.log(`Successfully updated API_BASE_URL in ${constantsFilePath}`);
  }
} catch (err) {
  console.error(`Error processing file: ${err}`);
  process.exit(1);
}

// Update docker-compose.yml if it exists
const dockerComposePath = path.join(__dirname, '..', '..', 'docker-compose.yml');
if (fs.existsSync(dockerComposePath)) {
  try {
    let dockerComposeContent = fs.readFileSync(dockerComposePath, 'utf8');
    const oldHost = dockerComposeContent.match(/EXPO_DEVTOOLS_HOST=[0-9\.]+/);
    
    if (oldHost && oldHost[0].includes(ip)) {
      console.log("EXPO_DEVTOOLS_HOST is already up to date.");
    } else {
      const newDockerComposeContent = dockerComposeContent
        .replace(/EXPO_DEVTOOLS_HOST=[0-9\.]+/g, `EXPO_DEVTOOLS_HOST=${ip}`)
        .replace(/REACT_NATIVE_PACKAGER_HOSTNAME=[0-9\.]+/g, `REACT_NATIVE_PACKAGER_HOSTNAME=${ip}`);

      if (newDockerComposeContent !== dockerComposeContent) {
        fs.writeFileSync(dockerComposePath, newDockerComposeContent, 'utf8');
        console.log(`Successfully updated EXPO_DEVTOOLS_HOST and REACT_NATIVE_PACKAGER_HOSTNAME in ${dockerComposePath}`);
      }
    }
  } catch (err) {
    console.error(`Error processing docker-compose.yml: ${err}`);
    // Don't exit here, as this is not critical
  }
} 