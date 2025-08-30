'use server'

import { clouddb } from "@/lib/configs/config-file";
import { systemLogger } from "@/lib/utils/api-debugger";
import archiver from 'archiver';
import { exec } from "child_process";
import { createWriteStream } from "fs";
import { readFile, rm } from "fs/promises";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import path from "path";
import { promisify } from "util";

export async function GET(req: Request) {

  try {

    const execPromise = promisify(exec);

    const dumpDir = path.resolve("./dump");
    const fileName = path.join(path.resolve('./'), 'db-backup.zip')

    await execPromise(`mongodump --uri="${clouddb}`);

    const output = createWriteStream(fileName);
    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.on('error', (err) => {
      throw new Error(`Archive error: ${err.message}`);
    });

    archive.pipe(output);
    archive.directory(dumpDir, false);

    await archive.finalize();

    await new Promise((resolve) => output.on('close', resolve));

    const fileBuffer = await readFile(fileName);

    await rm(dumpDir, { recursive: true, force: true });

    await rm("./db-backup.zip")

    return new Response(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="db-backup.zip"'
      },
    });

  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Requesting database backup.", "GET", "Fatal", "", "/backup")
    return NextResponse.json({ message: "Internal server error!" }, { status: 500 })
  }
}