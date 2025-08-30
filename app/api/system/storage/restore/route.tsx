import { clouddb } from '@/lib/configs/config-file';
import { systemLogger } from '@/lib/utils/api-debugger';
import { exec } from 'child_process';
import { createReadStream, writeFileSync } from 'fs';
import { rm } from 'fs/promises';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import unzipper from 'unzipper';
import { promisify } from 'util';

export async function POST(req: Request) {

  try {
    const execPromise = promisify(exec);

    const form = await req.formData()
    const file = form.get("file") as File | null

    if (!file) return NextResponse.json({ message: "Please upload the file!" }, { status: 400 })

    const arrayBuffer = await file.arrayBuffer()
    const filebuff = new Uint8Array(arrayBuffer)

    writeFileSync("./dump.zip", filebuff)

    const fileContents = createReadStream("./dump.zip");

    await new Promise((resolve, reject) => {
      fileContents
        .pipe(unzipper.Extract({ path: "./dump" }))
        .on('finish', () => {
          console.log('File unzipped successfully');
          resolve('File unzipped successfully'); // Resolve the promise when finished
        })
        .on('error', (err) => {
          console.error('Error while unzipping:', err);
          reject(new Error('Error while unzipping: ' + err.message)); // Reject the promise with the error
        });
    });

    const {
      stdout,
      stderr,
    } = await execPromise(`mongorestore --uri="${clouddb}" dump/antonios`);

    console.log(
      stdout,
      stderr
    )

    await rm("./dump/antonios", { recursive: true, force: true })
    await rm("./dump.zip", { recursive: true, force: true })

    return NextResponse.json({ status: 200 })

  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Requesting database backup.", "GET", "Fatal", "", "/restore")
    return NextResponse.json({ message: "internal server error" }, { status: 500 })
  }
};

