const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const api = supertest(app)
const helper = require('./test_helper')

jest.setTimeout(10000)

beforeEach(async () => {
  await Blog.deleteMany({})
  helper.initialBlogs.forEach(async (blog) => {
    let blogObject = new Blog(blog)
    await blogObject.save()
  })
})

test('Blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
}, 100000)

test('How many blogs', async () => {
  const response = await api.get('/api/blogs')
  expect(response.body).toHaveLength(5)
})

test('The first blog is about react patterns', async () => {
  const response = await api.get('/api/blogs')
  expect(response.body[0].title).toBe('React patterns')
})

test('Identifying field is named id', async () => {
  const response = await api.get('/api/blogs')
  expect(response.body[0].id).toBeDefined()
})

test('Create new blog post', async () => {
  const newBlog = {
    title: 'Raining',
    author: 'Malin',
    url: 'www.malin.com/',
    likes: 1
  }
  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

  const title = blogsAtEnd.map(n => n.title)
  expect(title).toContain(
    'Raining'
  )
})

test('Missing likes, show as 0', async () => {
  const newBlog ={
    title: 'Raining again',
    author: 'Malin',
    url: 'www.malin.com/'
  }
  await api
    .post('/api/blogs')
    .send(newBlog)

  const blogsAtEnd = await helper.blogsInDb()
  const blogLikes = blogsAtEnd.pop()
  expect(blogLikes.likes).toBe(0)
})

// test('Blog missing title and url, response with 400 Bad Request', async () => {
//   const newBlog = {
//     author: 'Malin',
//     likes: 33
//   }
//   await api
//     .post('/api/blogs')
//     .send(newBlog)
//     .expect(400)
//   const blogsAtEnd = await helper.blogsInDb()
//   expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
// })

afterAll(() => {
  mongoose.connection.close()
})