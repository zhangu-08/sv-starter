import { stdin, stdout } from 'node:process';

export function promptPassword(message = 'Password: '): Promise<string> {
	return new Promise((resolve, reject) => {
		if (!stdin.isTTY) {
			reject(new Error('Password must be entered interactively. Run this script in a terminal.'));
			return;
		}

		stdout.write(message);

		stdin.setRawMode(true);
		stdin.resume();
		stdin.setEncoding('utf8');

		let password = '';

		const onData = (char: string) => {
			switch (char) {
				case '\n':
				case '\r':
				case '\u0004':
					stdin.setRawMode(false);
					stdin.pause();
					stdin.removeListener('data', onData);
					stdout.write('\n');
					resolve(password);
					break;
				case '\u0003':
					stdin.setRawMode(false);
					stdout.write('\n');
					process.exit(130);
					break;
				case '\u007f':
				case '\b':
					password = password.slice(0, -1);
					break;
				default:
					if (char >= ' ' || char > '\u007f') {
						password += char;
					}
					break;
			}
		};

		stdin.on('data', onData);
	});
}
