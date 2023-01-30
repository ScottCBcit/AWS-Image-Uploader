import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import './App.css'

export default function App() {
  const [file, setFile] = useState()
  const [description, setDescription] = useState("")
  const [images, setImages] = useState([])
  const fileInput = useRef(null);

  const fetchImages = async () => {
    const result = await axios.get('/api/images')
    console.log(result.data)
    setImages([...result.data])
    console.log(images)
  }

  const deleteImage = async (id) => {
    const result = await axios.delete(`/api/images/${id}`)
    console.log(result)
    fetchImages()
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
    fileInput.current.value = ""
    setDescription("")
  }


  useEffect(() => {
    fetchImages()
  }, [])

  // <img src={`/api/${image.file_name}`} style={{maxWidth: "15rem"}}/>

  return (
    <div className="AppWrapper">
      <h1>Image Upload</h1>
      <form onSubmit={submit} className="form-top">
        <label htmlFor ="file">Upload Image</label>
        <input id='file'
          ref={fileInput}
          filename={file} 
          onChange={e => setFile(e.target.files[0])} 
          type="file" 
          accept="image/*"

        ></input>
        <label htmlFor ="description">Description</label>
        <textarea name="description" rows={4} cols={20} onChange={e => setDescription(e.target.value)} value={description}/>
        <button type="submit">Submit</button>
      </form>
      <ul style={{listStyleType: "none"}}>
        { images.map(image => <li key={image.id}>
          <h2>{image.description}</h2>
          <img src={image.imageURL} alt={image.description} />
          <button onClick={() => deleteImage(image.id)}>Delete</button>
          </li>)}
      </ul>  
    </div>
  )
}