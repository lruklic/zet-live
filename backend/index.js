require = require("esm")(module);
const fs = require("fs");
const GtfsRealtimeBindings = require("gtfs-realtime-bindings");

async function fetchAndParseGtfsRealtimeFeed() {
  try {
    const fetch = await import("node-fetch");

    const response = await fetch.default("https://www.zet.hr/gtfs-rt-protobuf", {
      headers: {
        //"x-api-key": "<redacted>",
        // Replace with your GTFS-realtime source's auth token
        // e.g., x-api-key is the header value used for NY's MTA GTFS APIs
      },
    });

    if (!response.ok) {
      throw new Error(
        `${response.url}: ${response.status} ${response.statusText}`
      );
    }

    const buffer = await response.buffer();
    const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
      buffer
    );

    const tripUpdates = feed.entity
      .filter((entity) => entity.tripUpdate)
      .map((entity) => entity.tripUpdate);

    const outputFilePath = "trip_updates.txt";
    const outputStream = fs.createWriteStream(outputFilePath);

    tripUpdates.forEach((tripUpdate) => {
      if (tripUpdate.trip.tripId && tripUpdate.trip.tripId.indexOf("268") > -1) {
        outputStream.write(JSON.stringify(tripUpdate) + "\n");
      }
    });

    outputStream.end();
    console.log(`Trip updates written to ${outputFilePath}`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

fetchAndParseGtfsRealtimeFeed();
