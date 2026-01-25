// src/components/Chatbot.js
import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot } from 'lucide-react';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { from: 'bot', text: "Hello! I'm Nirmaya's AI assistant. How can I help you today?" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        if (input.trim() === '') return;

        const userMessage = { from: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const systemPrompt = `You are a friendly and helpful AI assistant for Nirmaya Health, a smart hospital. Your goal is to help users by answering their questions about the hospital's services, departments, and doctors. You can guide them on how to book an appointment using the website's forms, but you cannot book it for them. Keep your answers concise and helpful.`;
            
            const chatHistory = [
                { role: "user", parts: [{ text: systemPrompt }] },
                { role: "model", parts: [{ text: "Understood. I am Nirmaya Health's AI assistant." }] },
                ...messages.map(msg => ({
                    role: msg.from === 'bot' ? 'model' : 'user',
                    parts: [{ text: msg.text }]
                })),
                { role: "user", parts: [{ text: input }] }
            ];

            const payload = { contents: chatHistory };
            const apiKey = "PASTE_YOUR_API_KEY_HERE"; // Replace with your API key
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error(`API request failed`);

            const result = await response.json();
            
            const botResponse = result.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't process that.";
            setMessages(prev => [...prev, { from: 'bot', text: botResponse }]);

        } catch (error) {
            console.error("Gemini API error:", error);
            setMessages(prev => [...prev, { from: 'bot', text: "Sorry, I'm having trouble connecting. Please try again later." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {isOpen && (
                <div className="fixed bottom-24 right-4 w-80 h-96 bg-white rounded-lg shadow-2xl flex flex-col z-50">
                    <div className="bg-blue-600 text-white p-3 flex justify-between items-center rounded-t-lg">
                        <h3 className="font-bold text-lg flex items-center"><Bot size={20} className="mr-2"/>Nirmaya AI Assistant</h3>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-blue-700 p-1 rounded-full"><X size={20} /></button>
                    </div>
                    <div className="flex-1 p-4 overflow-y-auto">
                        {messages.map((msg, index) => (
                            <div key={index} className={`my-2 ${msg.from === 'bot' ? 'text-left' : 'text-right'}`}>
                                <p className={`inline-block p-2 rounded-lg ${msg.from === 'bot' ? 'bg-gray-200' : 'bg-blue-500 text-white'}`}>
                                    {msg.text}
                                </p>
                            </div>
                        ))}
                        {isLoading && <div className="text-center"><p className="text-gray-500">Nirmaya AI is thinking...</p></div>}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="p-2 border-t flex">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Ask a question..."
                            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button onClick={handleSend} className="ml-2 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700">
                            <Send />
                        </button>
                    </div>
                </div>
            )}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-4 right-4 bg-blue-600 text-white px-5 py-3 rounded-full shadow-lg hover:bg-blue-700 transition-transform hover:scale-105 z-50 flex items-center space-x-3"
                aria-label="Open Chatbot"
            >
                <span className="font-semibold">Hey there, need help?</span>
                <MessageSquare size={24} />
            </button>
        </>
    );
};

export default Chatbot;
