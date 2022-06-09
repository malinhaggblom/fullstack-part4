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
  expect(response.body).toHaveLength(6)
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

test('Require title and url, else response with 400 Bad Request', async () => {
  const newBlog ={
    author: 'Something',
    likes: 1
  }
  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)

  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
})

test('Deleting blog post', async () => {
  const newBlog = {
    title: 'Hello',
    author: 'Malin',
    url: 'www.hello.com/',
    likes: 3
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(200)

  const blogsAtEnd = await helper.blogsInDb()
  const blogToDelete = blogsAtEnd[0]

  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .expect(204)

  const blogsAtEnd2 = await helper.blogsInDb()

  expect(blogsAtEnd2.length).toBe(
    helper.initialBlogs.length
  )
  const urls = blogsAtEnd2.map(b => b.url)

  expect(urls).not.toContain(blogToDelete.url)
})

test('Update likes on blog', async () => {
  const newBlog = {
    title: 'Hello',
    author: 'Malin',
    url: 'www.hello.com/',
    likes: 4
  }
  const result = await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(200)

  newBlog.likes += 1

  await api
    .put(`/api/blogs/${result.body.id}`)
    .send(newBlog)

  const blogsAtEnd = await helper.blogsInDb()

  expect(blogsAtEnd[6].likes).toBe(4)
})

afterAll(() => {
  mongoose.connection.close()
})