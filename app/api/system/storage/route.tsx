import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  // const client = new MongoClient("mongodb://localhost:27018,localhost:27019/?replicaSet=casatejada");
  try {
    // client.on('commandStarted', started => console.log(started));


    const dbStats = await prisma.$runCommandRaw({ dbStats: 1 })
    // const stat = await prisma.$runCommandRaw({ mongostat: 1 })
    const serverStatus = await prisma.$runCommandRaw({
      serverStatus: 1
    });


    // const databaseSize = dbStats.dataSize / (1024 * 1024 * 1024); // Convert bytes to GB
    // const memoryUsage = serverStatus.mem.resident / (1024 * 1024); // Convert bytes to MB
    // const uptime = serverStatus.uptime / 3600; // Convert seconds to hours
    // const cpuUsage = serverStatus.system.cpu.user / (serverStatus.system.cpu.total); // Example ratio, adjust as needed
    // const errorCount = serverStatus.extra_info.errors; // Replace with actual error metric
    // const queryLatency = serverStatus.extra_info.query_latency; // Replace with actual query latency
    // console.log(serverStatus.uptime)

    // Render the dashboard
    // console.log(`Database Size: ${databaseSize.toFixed(2)} GB`);
    // console.log(`Memory Usage: ${memoryUsage.toFixed(2)} MB`);
    // console.log(`Uptime: ${uptime.toFixed(2)} Hours`);
    // console.log(`CPU Usage: ${cpuUsage.toFixed(2)} %`);
    // console.log(`Error Count: ${errorCount}`);
    // console.log(`Query Latency: ${queryLatency.toFixed(2)} ms`);
    // console.log(process.memoryUsage())
    // console.log(process.uptime())
    // console.log(process.cpuUsage())
    // console.log(process.availableMemory())

    // await client.connect();
    // console.log('Connected to MongoDB');

    // const adminDb = client.db("casatejada");
    // const stats = await adminDb.command({ dbStats: 1 });

    return NextResponse.json(process.uptime(), { status: 200 })

    // console.log(`Database Size: ${stats.storageSize} bytes`);
  } catch (error) {
    console.error('Error fetching database size:', error);
    return NextResponse.json({ message: "Internal server error!" }, { status: 500 })
  }
}