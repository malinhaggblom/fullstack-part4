const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response) => {
  Blog.find({}).then(blogs => {
    response.json(blogs)
  })
})

blogsRouter.get('/:id', async (request, response, next) => {
  Blog.findById(request.params.id)
    .then(blog => {
      if (blog) {
        response.json(blog)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

blogsRouter.post('/', async (request, response) => {
  const body = request.body

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes === undefined ? 0 : body.likes,
  })
  if (body.title === undefined || body.url === undefined) {
    return response.status(400).json({ error: 'Title or url missing' })
  }
  const savedBlog = await blog.save()
  response.status(200).json(savedBlog)
})

blogsRouter.delete('/:id', async (request, response, next) => {
  try{
    const decodedToken = jwt.verify(request.token, process.env.SECRET)

    const blog = await Blog.findById(request.params.id)
      await Blog.findByIdAndRemove(request.params.id)
      response.status(204).end()
  } catch(exception) {
    next(exception)
  }
})

blogsRouter.put('/:id', async (request, response, next) => {
  const body = request.body
  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes
  }
})

module.exports = blogsRouter