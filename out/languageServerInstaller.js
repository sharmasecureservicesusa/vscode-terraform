"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const cp = require("child_process");
const crypto = require("crypto");
const fs = require("fs");
const https = require("https");
const os = require("os");
const semver = require("semver");
const yauzl = require("yauzl");
const releasesUrl = "https://releases.hashicorp.com/terraform-ls";
const hashiPublicKey = `mQENBFMORM0BCADBRyKO1MhCirazOSVwcfTr1xUxjPvfxD3hjUwHtjsOy/bT6p9f
W2mRPfwnq2JB5As+paL3UGDsSRDnK9KAxQb0NNF4+eVhr/EJ18s3wwXXDMjpIifq
fIm2WyH3G+aRLTLPIpscUNKDyxFOUbsmgXAmJ46Re1fn8uKxKRHbfa39aeuEYWFA
3drdL1WoUngvED7f+RnKBK2G6ZEpO+LDovQk19xGjiMTtPJrjMjZJ3QXqPvx5wca
KSZLr4lMTuoTI/ZXyZy5bD4tShiZz6KcyX27cD70q2iRcEZ0poLKHyEIDAi3TM5k
SwbbWBFd5RNPOR0qzrb/0p9ksKK48IIfH2FvABEBAAG0K0hhc2hpQ29ycCBTZWN1
cml0eSA8c2VjdXJpdHlAaGFzaGljb3JwLmNvbT6JATgEEwECACIFAlMORM0CGwMG
CwkIBwMCBhUIAgkKCwQWAgMBAh4BAheAAAoJEFGFLYc0j/xMyWIIAIPhcVqiQ59n
Jc07gjUX0SWBJAxEG1lKxfzS4Xp+57h2xxTpdotGQ1fZwsihaIqow337YHQI3q0i
SqV534Ms+j/tU7X8sq11xFJIeEVG8PASRCwmryUwghFKPlHETQ8jJ+Y8+1asRydi
psP3B/5Mjhqv/uOK+Vy3zAyIpyDOMtIpOVfjSpCplVRdtSTFWBu9Em7j5I2HMn1w
sJZnJgXKpybpibGiiTtmnFLOwibmprSu04rsnP4ncdC2XRD4wIjoyA+4PKgX3sCO
klEzKryWYBmLkJOMDdo52LttP3279s7XrkLEE7ia0fXa2c12EQ0f0DQ1tGUvyVEW
WmJVccm5bq25AQ0EUw5EzQEIANaPUY04/g7AmYkOMjaCZ6iTp9hB5Rsj/4ee/ln9
wArzRO9+3eejLWh53FoN1rO+su7tiXJA5YAzVy6tuolrqjM8DBztPxdLBbEi4V+j
2tK0dATdBQBHEh3OJApO2UBtcjaZBT31zrG9K55D+CrcgIVEHAKY8Cb4kLBkb5wM
skn+DrASKU0BNIV1qRsxfiUdQHZfSqtp004nrql1lbFMLFEuiY8FZrkkQ9qduixo
mTT6f34/oiY+Jam3zCK7RDN/OjuWheIPGj/Qbx9JuNiwgX6yRj7OE1tjUx6d8g9y
0H1fmLJbb3WZZbuuGFnK6qrE3bGeY8+AWaJAZ37wpWh1p0cAEQEAAYkBHwQYAQIA
CQUCUw5EzQIbDAAKCRBRhS2HNI/8TJntCAClU7TOO/X053eKF1jqNW4A1qpxctVc
z8eTcY8Om5O4f6a/rfxfNFKn9Qyja/OG1xWNobETy7MiMXYjaa8uUx5iFy6kMVaP
0BXJ59NLZjMARGw6lVTYDTIvzqqqwLxgliSDfSnqUhubGwvykANPO+93BBx89MRG
unNoYGXtPlhNFrAsB1VR8+EyKLv2HQtGCPSFBhrjuzH3gxGibNDDdFQLxxuJWepJ
EK1UbTS4ms0NgZ2Uknqn1WRU1Ki7rE4sTy68iZtWpKQXZEJa0IGnuI2sSINGcXCJ
oEIgXTMyCILo34Fa/C6VCm2WBgz9zZO8/rHIiQm1J5zqz0DrDwKBUM9C
=LYpS`;
class LanguageServerInstaller {
    install(directory) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                let identifer;
                let extensionVersion = '2.0.0'; // TODO set this programatically
                let vscodeVersion = vscode.version;
                identifer = `Terraform-VSCode/${extensionVersion} VSCode/${vscodeVersion}`;
                const lspCmd = `${directory}/terraform-ls --version`;
                cp.exec(lspCmd, (err, stdout, stderr) => {
                    if (err) {
                        this.checkCurrent(identifer).then((currentRelease) => {
                            fs.mkdirSync(directory, { recursive: true });
                            this.installPkg(directory, currentRelease, identifer).then(() => {
                                vscode.window.showInformationMessage(`Installed terraform-ls ${currentRelease.version}`);
                                return resolve();
                            }).catch((err) => {
                                return reject(err);
                            });
                        }).catch((err) => {
                            return reject(err);
                        });
                    }
                    else if (stderr) { // Version outputs to stderr
                        const installedVersion = stderr;
                        this.checkCurrent(identifer).then((currentRelease) => {
                            if (semver.gt(currentRelease.version, installedVersion, { includePrerelease: true })) {
                                const installMsg = `A new language server release is available: ${currentRelease.version}. Install now?`;
                                vscode.window.showInformationMessage(installMsg, 'Install', 'Cancel').then((selected) => {
                                    if (selected === 'Install') {
                                        fs.mkdirSync(directory, { recursive: true });
                                        this.installPkg(directory, currentRelease, identifer).then(() => {
                                            vscode.window.showInformationMessage(`Installed terraform-ls ${currentRelease.version}`);
                                            console.log(`LS installed to ${directory}`);
                                            return resolve();
                                        }).catch((err) => {
                                            vscode.window.showErrorMessage("Unable to complete terraform-ls install");
                                            return reject(err);
                                        });
                                    }
                                    else if (selected === 'Cancel') {
                                        return resolve();
                                    }
                                });
                            }
                            else {
                                return resolve();
                            }
                        });
                    }
                    else {
                        vscode.window.showErrorMessage('Unable to install terraform-ls');
                        console.log(stdout);
                        return reject();
                    }
                });
            });
        });
    }
    checkCurrent(identifier) {
        const headers = { 'User-Agent': identifier };
        return new Promise((resolve, reject) => {
            const request = https.request(`${releasesUrl}/index.json`, { headers: headers }, (response) => {
                if (response.statusCode !== 200) {
                    return reject(response.statusMessage);
                }
                let releaseData = "";
                response.on('data', (data) => {
                    releaseData += data;
                });
                response.on('end', () => {
                    try {
                        const releases = JSON.parse(releaseData).versions;
                        const currentRelease = Object.keys(releases).sort(semver.rcompare)[0];
                        return resolve(releases[currentRelease]);
                    }
                    catch (err) {
                        return reject(err);
                    }
                });
            });
            request.on('error', (error) => { return reject(error); });
            request.end();
        });
    }
    installPkg(installDir, release, identifer) {
        const destination = `${installDir}/terraform-ls_v${release.version}.zip`;
        let platform = os.platform().toString();
        if (platform === 'win32') {
            platform = 'windows';
        }
        let arch = os.arch();
        switch (arch) {
            case 'x64':
                arch = 'amd64';
                break;
            case 'x32':
                arch = '386';
                break;
        }
        const build = release.builds.find(b => b.os === platform && b.arch === arch);
        const downloadUrl = build.url;
        if (!downloadUrl) {
            // No matching build found
            return Promise.reject();
        }
        try {
            this.removeOldBin(installDir, platform);
        }
        catch (_a) {
            // ignore
        }
        return new Promise((resolve, reject) => {
            vscode.window.withProgress({
                cancellable: true,
                location: vscode.ProgressLocation.Notification,
                title: "Installing terraform-ls"
            }, (progress, token) => {
                token.onCancellationRequested(() => {
                    return reject();
                });
                progress.report({ increment: 30 });
                return new Promise((resolve, reject) => {
                    this.download(downloadUrl, destination, identifer).then(() => {
                        progress.report({ increment: 30 });
                        this.verify(release, destination, build.filename).then(() => {
                            progress.report({ increment: 30 });
                            return this.unpack(installDir, destination);
                        }).catch((err) => {
                            return reject(err);
                        });
                    });
                }).then(() => {
                    return resolve();
                }, (err) => {
                    try {
                        fs.unlinkSync(destination);
                    }
                    finally {
                        return reject(err);
                    }
                });
            });
        });
    }
    removeOldBin(directory, platform) {
        if (platform === "windows") {
            fs.unlinkSync(`${directory}/terraform-ls.exe`);
        }
        else {
            fs.unlinkSync(`${directory}/terraform-ls`);
        }
    }
    download(downloadUrl, installPath, identifier) {
        const headers = { 'User-Agent': identifier };
        return new Promise((resolve, reject) => {
            const request = https.request(downloadUrl, { headers: headers }, (response) => {
                if (response.statusCode === 301 || response.statusCode === 302) { // redirect for CDN
                    const redirectUrl = response.headers.location;
                    return resolve(this.download(redirectUrl, installPath, identifier));
                }
                if (response.statusCode !== 200) {
                    return reject(response.statusMessage);
                }
                const pkg = fs.createWriteStream(installPath);
                response.pipe(pkg);
                response.on('end', () => {
                    try {
                        return resolve();
                    }
                    catch (err) {
                        return reject(err);
                    }
                });
            });
            request.on('error', (error) => { return reject(error); });
            request.end();
        });
    }
    verify(release, pkg, buildName) {
        return new Promise((resolve, reject) => {
            const hash = crypto.createHash('sha256');
            const pkgStream = fs.createReadStream(pkg);
            const verifier = crypto.createVerify('sha256');
            pkgStream.on('data', (data) => {
                hash.update(data);
            });
            let shasumResponse = "";
            https.get(`${releasesUrl}/${release.version}/${release.shasums}`, (response) => {
                response.on('data', (data) => {
                    shasumResponse += data;
                    verifier.update(data);
                });
                response.on('end', () => {
                    verifier.end();
                    const shasumLine = shasumResponse.split(`\n`).find(line => line.includes(buildName));
                    if (!shasumLine) {
                        return reject(`Install error: no matching SHA sum for ${buildName}`);
                    }
                    let shasum = shasumLine.split(" ")[0];
                    if (hash.digest('hex') !== shasum) {
                        return reject(`Install error: SHA sum for ${buildName} does not match`);
                    }
                });
            }).on('error', (err) => {
                return reject(err);
            });
            let signature = "";
            // https://releases.hashicorp.com/terraform-ls/0.3.2/terraform-ls_0.3.2_SHA256SUMS.sig
            https.get(`${releasesUrl}/${release.version}/${release.shasums_signature}`, (response) => {
                response.setEncoding('hex');
                response.on('data', (data) => {
                    signature += data;
                });
                response.on('end', () => {
                    console.log(verifier.verify(hashiPublicKey, signature));
                    if (verifier.verify(hashiPublicKey, signature)) {
                        return resolve();
                    }
                    else {
                        return reject(`Install error: signature for ${buildName} does not match`);
                    }
                    ;
                });
            }).on('error', (err) => {
                return reject(err);
            });
        });
    }
    unpack(directory, pkgName) {
        return new Promise((resolve, reject) => {
            let executable;
            yauzl.open(pkgName, { lazyEntries: true }, (err, zipfile) => {
                if (err) {
                    return reject(err);
                }
                zipfile.readEntry();
                zipfile.on('entry', (entry) => {
                    zipfile.openReadStream(entry, (err, readStream) => {
                        if (err) {
                            return reject(err);
                        }
                        readStream.on('end', () => {
                            zipfile.readEntry(); // Close it
                        });
                        executable = `${directory}/${entry.fileName}`;
                        const destination = fs.createWriteStream(executable);
                        readStream.pipe(destination);
                    });
                });
                zipfile.on('close', () => {
                    fs.chmodSync(executable, '755');
                    return resolve();
                });
            });
        });
    }
}
exports.LanguageServerInstaller = LanguageServerInstaller;
//# sourceMappingURL=languageServerInstaller.js.map