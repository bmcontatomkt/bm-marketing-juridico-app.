import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Upload, CheckCircle2, MessageSquare, Copy, Plus } from 'lucide-react'
import logo from '../assets/logo.png'
import { db } from '../firebase'
import { collection, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore'

const AgencyDashboard = () => {
  const [posts, setPosts] = useState([])
  const [formData, setFormData] = useState({
    image: null,
    imagePreview: null,
    text: '',
    date: ''
  })
  const [generatedLink, setGeneratedLink] = useState('')
  const [showLinkModal, setShowLinkModal] = useState(false)

  useEffect(() => {
    // Subscribe to real-time updates from Firestore
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const postsData = []
      querySnapshot.forEach((doc) => {
        postsData.push({ id: doc.id, ...doc.data() })
      })
      setPosts(postsData)
    })

    return () => unsubscribe()
  }, [])

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData({
          ...formData,
          image: reader.result,
          imagePreview: reader.result
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.image || !formData.text || !formData.date) {
      alert('Por favor, preencha todos os campos')
      return
    }

    try {
      const newPost = {
        image: formData.image,
        text: formData.text,
        date: formData.date,
        status: 'pending',
        feedback: null,
        createdAt: new Date().toISOString()
      }

      const docRef = await addDoc(collection(db, 'posts'), newPost)

      const link = `${window.location.origin}/client/${docRef.id}`
      setGeneratedLink(link)
      setShowLinkModal(true)

      setFormData({
        image: null,
        imagePreview: null,
        text: '',
        date: ''
      })
    } catch (error) {
      console.error('Erro ao salvar publicação:', error)
      alert('Erro ao salvar publicação. Tente novamente.')
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink)
    alert('Link copiado para a área de transferência!')
  }

  const getStatusBadge = (status) => {
    if (status === 'approved') {
      return (
        <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full">
          <CheckCircle2 className="w-4 h-4" />
          <span className="text-sm font-medium">Aprovada</span>
        </div>
      )
    } else if (status === 'feedback') {
      return (
        <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
          <MessageSquare className="w-4 h-4" />
          <span className="text-sm font-medium">Com Feedback</span>
        </div>
      )
    } else {
      return (
        <div className="flex items-center gap-2 text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          <span className="text-sm font-medium">Aguardando</span>
        </div>
      )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-amber-50/30 to-white">
      {/* Header */}
      <header className="bg-white border-b border-amber-200/50 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <img src={logo} alt="B&M Marketing Jurídico" className="h-12" />
            <h1 className="text-xl font-semibold text-gray-800">Aprovação de Conteúdo</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div>
            <Card className="border-amber-200/50 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-amber-50 to-white border-b border-amber-200/50">
                <CardTitle className="text-2xl text-gray-800">Nova Publicação</CardTitle>
                <CardDescription>Crie uma nova arte para aprovação do cliente</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Image Upload */}
                  <div className="space-y-2">
                    <Label htmlFor="image" className="text-gray-700">Arte/Imagem</Label>
                    <div className="border-2 border-dashed border-amber-300 rounded-lg p-8 text-center hover:border-amber-400 transition-colors cursor-pointer bg-amber-50/30">
                      <input
                        type="file"
                        id="image"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <label htmlFor="image" className="cursor-pointer">
                        {formData.imagePreview ? (
                          <img 
                            src={formData.imagePreview} 
                            alt="Preview" 
                            className="max-h-48 mx-auto rounded-lg shadow-md"
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-3">
                            <Upload className="w-12 h-12 text-amber-500" />
                            <p className="text-gray-600">Clique para fazer upload da arte</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Text */}
                  <div className="space-y-2">
                    <Label htmlFor="text" className="text-gray-700">Texto da Publicação</Label>
                    <Textarea
                      id="text"
                      placeholder="Digite o texto da publicação..."
                      value={formData.text}
                      onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                      className="min-h-32 border-amber-200 focus:border-amber-400"
                    />
                  </div>

                  {/* Date */}
                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-gray-700">Data da Postagem</Label>
                    <Input
                      type="date"
                      id="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="border-amber-200 focus:border-amber-400"
                    />
                  </div>

                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium py-6 shadow-lg hover:shadow-xl transition-all"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Gerar Link para Cliente
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Posts List */}
          <div>
            <Card className="border-amber-200/50 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-amber-50 to-white border-b border-amber-200/50">
                <CardTitle className="text-2xl text-gray-800">Publicações Enviadas</CardTitle>
                <CardDescription>Acompanhe o status de aprovação</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {posts.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p>Nenhuma publicação enviada ainda</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                    {posts.map((post) => (
                      <Card key={post.id} className="border-amber-200/50 hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            <img 
                              src={post.image} 
                              alt="Arte" 
                              className="w-24 h-24 object-cover rounded-lg shadow-sm"
                            />
                            <div className="flex-1 space-y-2">
                              <div className="flex items-start justify-between">
                                <p className="text-sm text-gray-700 line-clamp-2">{post.text}</p>
                              </div>
                              <p className="text-xs text-gray-500">Data: {new Date(post.date).toLocaleDateString('pt-BR')}</p>
                              {getStatusBadge(post.status)}
                              {post.feedback && (
                                <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                  <p className="text-xs font-medium text-amber-900 mb-1">Feedback do Cliente:</p>
                                  <p className="text-sm text-gray-700">{post.feedback}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md border-amber-200 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-white border-b border-amber-200/50">
              <CardTitle className="text-xl text-gray-800">Link Gerado com Sucesso!</CardTitle>
              <CardDescription>Compartilhe este link com seu cliente</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="p-4 bg-gray-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-gray-700 break-all">{generatedLink}</p>
              </div>
              <div className="flex gap-3">
                <Button 
                  onClick={copyToClipboard}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar Link
                </Button>
                <Button 
                  onClick={() => setShowLinkModal(false)}
                  variant="outline"
                  className="flex-1 border-amber-300 hover:bg-amber-50"
                >
                  Fechar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default AgencyDashboard
