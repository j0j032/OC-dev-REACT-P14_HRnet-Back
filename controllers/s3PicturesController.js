const sharp = require('sharp')
const {
	DeleteObjectCommand,
	GetObjectCommand,
	PutObjectCommand,
	S3Client
} = require('@aws-sdk/client-s3')
const {getSignedUrl} = require('@aws-sdk/s3-request-presigner')
const dotenv = require('dotenv')

dotenv.config()

const bucketName = process.env.AWS_BUCKET_NAME
const region = process.env.AWS_BUCKET_REGION
const accessKeyId = process.env.AWS_ACCESS_KEY
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY

const s3Client = new S3Client({
	credentials: {
		accessKeyId,
		secretAccessKey
	},
	region
})

async function uploadFile(fileBuffer, fileName, mimetype) {
	const webpBuffer = await sharp(fileBuffer)
		.webp({quality: 60}).resize(540, 540)
		.toBuffer()
	
	const uploadParams = {
		Bucket: bucketName,
		Body: webpBuffer,
		Key: fileName,
		ContentType: 'image/webp'
	}
	
	return s3Client.send(new PutObjectCommand(uploadParams))
}

function deleteFile(fileName) {
	const deleteParams = {
		Bucket: bucketName,
		Key: fileName
	}
	
	return s3Client.send(new DeleteObjectCommand(deleteParams))
}

async function getObjectSignedUrl(key) {
	const params = {
		Bucket: bucketName,
		Key: key
	}
	
	// https://aws.amazon.com/blogs/developer/generate-presigned-url-modular-aws-sdk-javascript/
	const command = new GetObjectCommand(params)
	const seconds = 60
	return await getSignedUrl(s3Client, command, {expiresIn: seconds})
}

module.exports = {uploadFile, deleteFile, getObjectSignedUrl}
