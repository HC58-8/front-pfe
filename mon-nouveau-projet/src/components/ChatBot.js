import React, { useState, useRef } from 'react';
import axios from 'axios';

const ChatBot = () => {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Bonjour! Comment puis-je vous aider aujourd\'hui ?' },
  ]);
  const [userMessage, setUserMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);  // Contrôler l'ouverture de la fenêtre de chat
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 }); // Position du chat
  const chatRef = useRef(null); // Référence pour le chat

  // Fonction pour envoyer le message de l'utilisateur et obtenir une réponse du bot
  const handleSendMessage = async () => {
    if (userMessage.trim() !== '') {
      // Ajouter le message de l'utilisateur
      setMessages((prevMessages) => [...prevMessages, { sender: 'user', text: userMessage }]);
      setIsLoading(true);  // Activer l'indicateur de chargement

      // Envoyer le message à l'API IA (exemple avec OpenAI)
      try {
        const response = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-4', // ou 'gpt-3.5-turbo' selon votre préférence
            messages: [
              { role: 'system', content: 'Vous êtes un assistant utile.' },
              { role: 'user', content: userMessage },
            ],
          },
          {
            headers: {
              'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
            },
          }
        );

        const botResponse = response.data.choices[0].message.content;

        // Ajouter la réponse du bot
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: 'bot', text: botResponse },
        ]);
      } catch (error) {
        console.error('Erreur API:', error.response ? error.response.data : error.message);
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: 'bot', text: 'Désolé, une erreur est survenue.' },
        ]);
      } finally {
        setIsLoading(false);  // Désactiver l'indicateur de chargement
      }

      // Réinitialiser l'input
      setUserMessage('');
    }
  };

  // Fonction pour gérer le déplacement de la fenêtre de chat
  const startDrag = (e) => {
    setIsDragging(true);
  };

  const stopDrag = () => {
    setIsDragging(false);
  };

  const handleDrag = (e) => {
    if (isDragging) {
      const newX = e.clientX - chatRef.current.offsetWidth / 2;
      const newY = e.clientY - chatRef.current.offsetHeight / 2;
      setPosition({ x: newX, y: newY });
    }
  };

  // Fonction pour ouvrir/fermer le chat
  const toggleChat = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div>
      {/* Bulle flottante fixée en bas à droite */}
      <div
        className="fixed bottom-5 right-5 cursor-pointer"
        onClick={toggleChat}
      >
        <div className="bg-blue-500 text-white p-3 rounded-full">
          💬
        </div>
      </div>

      {/* Fenêtre de chat, qui peut être déplacée librement */}
      {isOpen && (
        <div
          ref={chatRef}
          className="absolute"
          style={{ top: `${position.y}px`, left: `${position.x}px` }}
          onMouseDown={startDrag}
          onMouseUp={stopDrag}
          onMouseMove={handleDrag}
        >
          <div className="bg-white shadow-lg rounded-lg w-80 h-96 p-4">
            <button
              onClick={toggleChat}
              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full"
            >
              X
            </button>
            <div className="flex flex-col h-full">
              <div className="flex-1 overflow-y-auto">
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg max-w-[80%] ${
                        message.sender === 'bot'
                          ? 'bg-gray-200'
                          : 'bg-blue-500 text-white ml-auto'
                      }`}
                    >
                      {message.text}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="p-3 rounded-lg max-w-[80%] bg-gray-300 animate-pulse">...</div>
                  )}
                </div>
              </div>
              <div className="mt-4 flex">
                <input
                  type="text"
                  placeholder="Tapez un message..."
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  className="flex-1 p-2 rounded-l-lg border border-gray-300"
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-blue-500 text-white p-2 rounded-r-lg hover:bg-blue-600"
                >
                  Envoyer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
