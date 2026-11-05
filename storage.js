
const fs = require('fs');
const path = require('path');

const bucket = process.env.S3_BUCKET;

if (bucket) {
  const {
    S3Client, ListObjectsV2Command, PutObjectCommand,
    DeleteObjectCommand, CopyObjectCommand, GetObjectCommand,
  } = require('@aws-sdk/client-s3');
  const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
  const s3 = new S3Client({ region: process.env.AWS_REGION });

  module.exports = {
    mode: 'cloud',
    async list() {
      const out = await s3.send(new ListObjectsV2Command({ Bucket: bucket }));
      return (out.Contents || []).map((o) => ({
        name: o.Key, size: o.Size, modified: o.LastModified,
      }));
    },
    async save(name, buffer, type) {
      await s3.send(new PutObjectCommand({
        Bucket: bucket, Key: name, Body: buffer, ContentType: type,
      }));
    },
    async remove(name) {
      await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: name }));
    },
    async rename(oldName, newName) {
      await s3.send(new CopyObjectCommand({
        Bucket: bucket,
        CopySource: encodeURIComponent(`${bucket}/${oldName}`),
        Key: newName,
      }));
      await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: oldName }));
    },
    async downloadUrl(name) {
      return getSignedUrl(
        s3,
        new GetObjectCommand({
          Bucket: bucket, Key: name,
          ResponseContentDisposition: `attachment; filename="${name}"`,
        }),
        { expiresIn: 300 } 
      );
    },
  };
} else {
  const dir = path.join(__dirname, 'uploads');
  fs.mkdirSync(dir, { recursive: true });
  const p = (n) => path.join(dir, path.basename(n));

  module.exports = {
    mode: 'local',
    dir,
    async list() {
      return fs.readdirSync(dir).map((n) => {
        const s = fs.statSync(p(n));
        return { name: n, size: s.size, modified: s.mtime };
      });
    },
    async save(name, buffer) { fs.writeFileSync(p(name), buffer); },
    async remove(name) { fs.unlinkSync(p(name)); },
    async rename(oldName, newName) { fs.renameSync(p(oldName), p(newName)); },
    async downloadUrl(name) { return `/api/local/${encodeURIComponent(name)}`; },
  };
}
