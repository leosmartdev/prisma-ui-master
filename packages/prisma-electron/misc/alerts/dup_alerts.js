
var record = db.alerts.findOne();
var name = record.me.match.track.metadata[0].name.trim();
for (var i = 0; i < 200; i++) {
    record._id = new ObjectId();
    var count = i + 1;
    record.me.match.track.metadata[0].name = name + " (" + count + ")";
    db.alerts.insert(record);
}