import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle2, MessageSquare, Calendar } from 'lucide-react'
import logo from '../assets/logo.png'
import { db } from '../firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'

const ClientView = () => {
  const { postId } = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showFeedbackForm, setShowFeedbackForm] = useState(false)
  const [feedbackText, setFeedbackText] = useState('')
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [successType, setSuccessType] = useState('')

  useEffect(() => {
    loadPost()
  }, [postId])

  const loadPost = async () => {
    try {
      const docRef = doc(db, 'posts', postId)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        setPost({ id: docSnap.id, ...docSnap.data() })
      } else {
        setPost(null)
      }
    } catch (error) {
      console.error('Erro ao carregar publicação:', error)
      setPost(null)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    try {
      const docRef = doc(db, 'posts', postId)
      await updateDoc(docRef, {
        status: 'approved'
      })
      setPost({ ...post, status: 'approved' })
      setSuccessType('approved')
      setShowSuccessMessage(true)
    } catch (error) {
      console.error('Erro ao aprovar publicação:', error)
      alert('Erro ao aprovar publicação. Tente novamente.')
    }
  }

  const handleFeedbackSubmit = async () => {
    if (!feedbackText.trim()) {
      alert('Por favor, escreva seu feedback antes de enviar')
      return
    }

    try {
      const docRef = doc(db, 'posts', postId)
      await updateDoc(docRef, {
        status: 'feedback',
        feedback: feedbackText
      })
      setPost({ ...post, status: 'feedback', feedback: feedbackText })
      setSuccessType('feedback')
      setShowSuccessMessage(true)
      setShowFeedbackForm(false)
      setFeedbackText('')
    } catch (error) {
      console.error('Erro ao enviar feedback:', error)
      alert('Erro ao enviar feedback. Tente novamente.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-amber-50/30 to-white flex items-center justify-center">
        <Card className="w-full max-w-md border-amber-200 shadow-lg">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600">Carregando...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-amber-50/30 to-white flex items-center justify-center">
        <Card className="w-full max-w-md border-amber-200 shadow-lg">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600">Publicação não encontrada</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-amber-50/30 to-white">
      {/* Header */}
      <header className="bg-white border-b border-amber-200/50 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-center">
            <img src={logo} alt="B&M Marketing Jurídico" className="h-12" />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-3xl">
        <Card className="border-amber-200/50 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-amber-50 to-white border-b border-amber-200/50">
            <CardTitle className="text-2xl text-gray-800 text-center">Aprovação de Conteúdo</CardTitle>
            <CardDescription className="text-center">Revise o conteúdo e escolha uma ação</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* Image */}
            <div className="flex justify-center">
              <img 
                src={post.image} 
                alt="Arte para aprovação" 
                className="max-w-full rounded-lg shadow-lg"
              />
            </div>

            {/* Text */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-800">Texto da Publicação</h3>
              <div className="p-4 bg-gray-50 border border-amber-200 rounded-lg">
                <p className="text-gray-700 whitespace-pre-wrap">{post.text}</p>
              </div>
            </div>

            {/* Date */}
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-5 h-5 text-amber-500" />
              <span className="font-medium">Data da Postagem:</span>
              <span>{new Date(post.date).toLocaleDateString('pt-BR', { 
                day: '2-digit', 
                month: 'long', 
                year: 'numeric' 
              })}</span>
            </div>

            {/* Action Buttons */}
            {post.status === 'pending' && (
              <div className="space-y-3 pt-4">
                <Button 
                  onClick={handleApprove}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-6 shadow-lg hover:shadow-xl transition-all"
                >
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Aprovar Conteúdo
                </Button>

                {!showFeedbackForm ? (
                  <Button 
                    onClick={() => setShowFeedbackForm(true)}
                    variant="outline"
                    className="w-full border-amber-400 text-amber-700 hover:bg-amber-50 font-medium py-6 shadow-md hover:shadow-lg transition-all"
                  >
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Dar Feedback
                  </Button>
                ) : (
                  <div className="space-y-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <h4 className="font-semibold text-gray-800">Escreva seu feedback</h4>
                    <Textarea
                      placeholder="Digite suas observações aqui..."
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      className="min-h-32 border-amber-300 focus:border-amber-400"
                    />
                    <div className="flex gap-3">
                      <Button 
                        onClick={handleFeedbackSubmit}
                        className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
                      >
                        Enviar Feedback
                      </Button>
                      <Button 
                        onClick={() => {
                          setShowFeedbackForm(false)
                          setFeedbackText('')
                        }}
                        variant="outline"
                        className="flex-1 border-gray-300 hover:bg-gray-50"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Status Display */}
            {post.status === 'approved' && (
              <div className="p-6 bg-green-50 border-2 border-green-200 rounded-lg text-center">
                <CheckCircle2 className="w-16 h-16 mx-auto mb-3 text-green-600" />
                <h3 className="text-xl font-semibold text-green-800 mb-2">Conteúdo Aprovado!</h3>
                <p className="text-green-700">Obrigado pela sua aprovação. A agência foi notificada.</p>
              </div>
            )}

            {post.status === 'feedback' && (
              <div className="p-6 bg-amber-50 border-2 border-amber-200 rounded-lg text-center">
                <MessageSquare className="w-16 h-16 mx-auto mb-3 text-amber-600" />
                <h3 className="text-xl font-semibold text-amber-800 mb-2">Feedback Enviado!</h3>
                <p className="text-amber-700 mb-4">Obrigado pelo seu feedback. A agência irá revisar e enviar uma nova versão.</p>
                {post.feedback && (
                  <div className="mt-4 p-4 bg-white border border-amber-200 rounded-lg text-left">
                    <p className="text-sm font-medium text-amber-900 mb-2">Seu feedback:</p>
                    <p className="text-gray-700">{post.feedback}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Success Message Modal */}
      {showSuccessMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md border-amber-200 shadow-2xl animate-in fade-in zoom-in duration-300">
            <CardContent className="pt-6 text-center space-y-4">
              {successType === 'approved' ? (
                <>
                  <CheckCircle2 className="w-20 h-20 mx-auto text-green-600" />
                  <h3 className="text-2xl font-bold text-gray-800">Seu conteúdo foi aprovado!</h3>
                  <p className="text-gray-600">A agência foi notificada da sua aprovação.</p>
                </>
              ) : (
                <>
                  <MessageSquare className="w-20 h-20 mx-auto text-amber-600" />
                  <h3 className="text-2xl font-bold text-gray-800">Feedback enviado!</h3>
                  <p className="text-gray-600">A agência receberá suas observações e retornará em breve.</p>
                </>
              )}
              <Button 
                onClick={() => setShowSuccessMessage(false)}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white mt-4"
              >
                Fechar
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default ClientView
