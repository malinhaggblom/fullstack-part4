const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('Please provide the password as an argument: node mongo.js <password>')
  process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://fullstackpart4:${password}@cluster0.7yjdlk8.mongodb.net/?retryWrites=true&w=majority`

const blogSchema = new mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: Number
})

const Blog = mongoose.model('Blog', blogSchema)

const mongoUrl = 'mongodb://localhost/bloglist'
mongoose
  .connect(mongoUrl)
  .then((result) => {
    console.log('connected')

    const blog = new Blog({
      title: 'This is the blog title',
      author: 'Malin',
      url: www.something.com,
      likes: 1,
    })

    return blog.save()
  })
  .then(() => {
    console.log('blog saved!')
    return mongoose.connection.close()
  })
  .catch((err) => console.log(err))