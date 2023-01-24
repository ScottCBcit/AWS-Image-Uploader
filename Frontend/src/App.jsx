import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

export default function App() {
  const [file, setFile] = useState()
  const [description, setDescription] = useState("")
  const [images, setImages] = useState([])

  const fetchImages = async () => {
    const result = await axios.get('/api/images')
    console.log(result.data)
    setImages([...result.data])
    console.log(images)
  }

  const submit = async event => {
    event.preventDefault()

    const formData = new FormData()
    formData.append("image", file)
    formData.append("description", description)

    const result = await axios.post('/api/images', formData, { headers: {'Content-Type': 'multipart/form-data'}})
    const newImage = await result.data.imagePath

    console.log(newImage)

    fetchImages()
    setDescription("")
    setFile()
  }


  useEffect(() => {
    fetchImages()
    console.log(images)
  }, [])

  

  return (
    <div className="AppWrapper">
      <h1>Image Upload</h1>
      <form onSubmit={submit} className="form-top">
        <label htmlFor ="file">Upload Image</label>
        <input id='file'
          filename={file} 
          onChange={e => setFile(e.target.files[0])} 
          type="file" 
          accept="image/*"
        ></input>
        <label htmlFor ="description">Description</label>
        <textarea name="description" rows={4} cols={20} onChange={e => setDescription(e.target.value)}/>
        <button type="submit">Submit</button>
      </form>
      <ul style={{listStyleType: "none"}}>
        { images.map(image => <li key={image.id}>
          <img src={`/api/${image.file_name}`} style={{maxWidth: "15rem"}}/>
          <h2>{image.description}</h2>
          </li>)}
      </ul>  
    </div>
  )
}