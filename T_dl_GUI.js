(async () => {
    const WebTorrent = await import('webtorrent');
    const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });
    const rl = require('readline'); // Import readline module for cursor manipulation
    const { exec } = require('child_process');
    const client = new WebTorrent.default();

    // Function to open a folder
    const openFolder = (folderPath) => {
        let command;

        // Determine the command based on the platform
        switch (process.platform) {
            case 'win32':
                command = `start "" "${folderPath}"`;
                break;
            case 'darwin':
                command = `open "${folderPath}"`;
                break;
            case 'linux':
                command = `xdg-open "${folderPath}"`;
                break;
            default:
                console.error('Unsupported platform!');
                return;
        }

        // Execute the command
        exec(command, (err) => {
            if (err) {
                console.error(`Error opening folder: ${err}`);
            } else {
                console.log(`Folder opened: ${folderPath}`);
            }
        });
    };

    readline.question('Please enter your magnet URI: ', magnetURI => {
        client.add(magnetURI, { path: './downloads' }, torrent => {

            // Initialize previous download count
            torrent._prevDownloaded = torrent.downloaded;
            const startTime = Date.now();

            // Use process.stdout to update the progress in place
            let interval = setInterval(() => {
                const downloadedMB = (torrent.downloaded / 1024 / 1024).toFixed(2);
                const downloadSpeedMBps = (torrent.downloadSpeed / 1024 / 1024).toFixed(2);
                const progressPercentage = (torrent.progress * 100).toFixed(2);

                // Calculate remaining size to download
                const remainingMB = ((torrent.length - torrent.downloaded) / 1024 / 1024).toFixed(2);

                // Estimate remaining download time
                const estimatedTimeSec = torrent.downloadSpeed > 0 ? (torrent.length - torrent.downloaded) / torrent.downloadSpeed : -1;
                const estimatedTimeMin = (estimatedTimeSec / 60).toFixed(2);

                // Calculate elapsed time and average speed
                const elapsedTimeSec = (Date.now() - startTime) / 1000;
                const averageSpeedMBps = (torrent.downloaded / 1024 / 1024) / elapsedTimeSec;

                // Create a text-based progress bar
                const progressBarLength = 20; // Length of the progress bar
                const completedBars = Math.round(progressBarLength * (torrent.progress));
                const progressBar = '🧨'.repeat(completedBars).padEnd(progressBarLength, ' ');

                // Clear the previous output and update in place
                rl.cursorTo(process.stdout, 0, 0);  // Move the cursor to the beginning of the line
                rl.clearScreenDown(process.stdout); // Clear everything below the cursor

                process.stdout.write(
                    `[🏴‍☠️]Torrent Downloader Made by MrFan3asizer[🏴‍☠️]\n` +
                    `File name: [🔔]${torrent.name}[🔔]\n` +
                    `File size: [🚨]${(torrent.length / 1024 / 1024).toFixed(2)} MB[🚨]\n` +
                    `Downloaded: [⚓]${downloadedMB} MB[⚓]\n` +
                    `Remaining: [🛒]${remainingMB} MB[🛒]\n` +
                    `Download speed: [✨]${downloadSpeedMBps} MB/sec[✨]\n` +
                    `Progress: [🎯]${progressBar}[🎯] ${progressPercentage}%\n` +
                    `Remaining time: [⏳]${estimatedTimeSec >= 0 ? estimatedTimeMin : 'Unknown'} minutes[⏳]\n` +
                    `Average download speed: [🏆]${averageSpeedMBps.toFixed(2)} MB/sec[🏆]\n` +
                    `📢Telegram: @FansyArtAi\n`
                );

                torrent._prevDownloaded = torrent.downloaded;
            }, 1000);

            torrent.on('done', () => {
                clearInterval(interval);
                console.log('\nTorrent download finished');
                openFolder('./downloads');
                client.destroy();
                readline.close();
            });
        });

        client.on('error', err => {
            console.error('Error downloading:', err);
            readline.close();
        });
    });
})();
