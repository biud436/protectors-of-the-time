import * as cp from 'child_process';
import * as path from 'path';

import express from 'express';

export const router = express.Router();
router.get('/', (_req, _res) => {
    const child = cp.exec('yarn start', {
        cwd: path.resolve(__dirname, '..', '..', '..'),
    });

    child.stdout.on('data', (data) => {
        console.log(data.toString());
    });

    child.stderr.on('data', (data) => {
        console.error(data.toString());
    });

    child.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
    });

    process.on('exit', () => {
        child.kill();
    });

    _res.status(200).json({
        message: 'success',
    });
});
