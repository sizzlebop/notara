import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useNotes } from '@/context/NotesContextTypes';
import { toast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { 
  MessageSquare, 
  FileText, 
  Image as ImageIcon, 
  Search, 
  Plus, 
  Check, 
  X 
} from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: string;
  imageUrl?: string;
}

// Configuration for the Pollinations API
const API_CONFIG = {
  textModel: 'openai-large',
  imageModel: 'flux',
  private: true,
  enhance: true,
  noLogo: true,
  safe: false
};

// System prompt for the AI assistant
const SYSTEM_PROMPT = `You are Notara's AI assistant, designed to help users with their notes and writing.
You can:
1. Answer questions about the user's notes
2. Generate creative content
3. Summarize existing notes
4. Provide writing prompts and suggestions
5. Help organize information

Be concise, helpful, and creative. When generating content, focus on quality and relevance to the user's needs.
If asked to create images, describe what you would generate but don't attempt to create the image yourself - the user will use the image generation button.`;

const AiAssistant: React.FC = () => {
  const { notes, addNote } = useNotes();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm your AI assistant for Notara. I can help you with your notes, generate ideas, or answer questions. How can I help you today?",
      sender: 'ai',
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [imagePrompt, setImagePrompt] = useState('');
  const [showImagePrompt, setShowImagePrompt] = useState(false);
  const [imageSize, setImageSize] = useState<{ width: number, height: number }>({ width: 1024, height: 1024 });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isProcessing) return;
    
    // Add user message
    const userMessage: Message = {
      id: uuidv4(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);
    setIsProcessing(true);
    
    try {
      // Initialize response message with empty content
      setMessages(prev => [
        ...prev,
        {
          id: uuidv4(),
          content: '',
          sender: 'ai',
          timestamp: new Date().toISOString()
        }
      ]);

      await streamChatCompletion(
        [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages.filter(msg => msg.imageUrl === undefined).map(msg => ({ 
            role: msg.sender === 'user' ? 'user' : 'assistant' as 'user' | 'assistant', 
            content: msg.content 
          })),
          { role: "user", content: inputMessage }
        ],
        handleStreamChunk
      );
    } catch (error) {
      console.error("Error in chat completion:", error);
      
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last.sender === 'ai' && last.content === '') {
          return [
            ...prev.slice(0, -1),
            {
              id: uuidv4(),
              content: "I'm sorry, I encountered an error processing your request. Please try again.",
              sender: 'ai',
              timestamp: new Date().toISOString()
            }
          ];
        }
        return [
          ...prev,
          {
            id: uuidv4(),
            content: "I'm sorry, I encountered an error processing your request. Please try again.",
            sender: 'ai',
            timestamp: new Date().toISOString()
          }
        ];
      });
    } finally {
      setIsTyping(false);
      setIsProcessing(false);
    }
  };

  // Handle incoming stream chunks
  const handleStreamChunk = (chunk: string) => {
    setMessages(prev => {
      const lastIndex = prev.length - 1;
      const lastMessage = prev[lastIndex];
      
      // If the last message is from the AI and was just created, append to it
      if (lastMessage && lastMessage.sender === 'ai' && lastMessage.content === '') {
        const updatedMessages = [...prev];
        updatedMessages[lastIndex] = {
          ...lastMessage,
          content: chunk
        };
        return updatedMessages;
      } else if (lastMessage && lastMessage.sender === 'ai') {
        const updatedMessages = [...prev];
        updatedMessages[lastIndex] = {
          ...lastMessage,
          content: lastMessage.content + chunk
        };
        return updatedMessages;
      } else {
        // Otherwise create a new message
        return [
          ...prev,
          {
            id: uuidv4(),
            content: chunk,
            sender: 'ai',
            timestamp: new Date().toISOString()
          }
        ];
      }
    });
  };

  // Stream chat completion from Pollinations API
  const streamChatCompletion = async (messages: Array<{ role: string, content: string }>, onChunkReceived: (chunk: string) => void) => {
    try {
      const payload = {
        model: API_CONFIG.textModel,
        messages: messages,
        private: API_CONFIG.private,
        stream: true,
      };

      const response = await fetch("https://text.pollinations.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorText}`
        );
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Failed to get reader from response");
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log("Stream finished.");
          break;
        }

        buffer += decoder.decode(value, { stream: true });

        // Process buffer line by line (SSE format: data: {...}\n\n)
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || ""; // Keep the potentially incomplete last line

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.substring(6).trim();
            if (dataStr === "[DONE]") {
              console.log("Received [DONE] marker.");
              continue;
            }
            try {
              const chunk = JSON.parse(dataStr);
              const content = chunk?.choices?.[0]?.delta?.content;
              if (content && onChunkReceived) {
                onChunkReceived(content);
              }
            } catch (e) {
              console.error("Failed to parse stream chunk:", dataStr, e);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error during streaming chat completion:", error);
      throw error;
    }
  };

  // Generate focus prompts
  const handleGenerateFocusPrompt = async () => {
    setIsTyping(true);
    setIsProcessing(true);
    
    try {
      // Initialize response message with empty content
      setMessages(prev => [
        ...prev,
        {
          id: uuidv4(),
          content: '',
          sender: 'ai',
          timestamp: new Date().toISOString()
        }
      ]);

      await streamChatCompletion(
        [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: "Generate a creative writing prompt to help me focus and get past writer's block. Make it thoughtful and inspiring." }
        ],
        handleStreamChunk
      );
      
      toast({
        title: "Focus Prompt Generated",
        description: "A new writing prompt has been created to help you focus."
      });
    } catch (error) {
      console.error("Error generating focus prompt:", error);
      
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last.sender === 'ai' && last.content === '') {
          return [
            ...prev.slice(0, -1),
            {
              id: uuidv4(),
              content: "I'm sorry, I encountered an error generating a focus prompt. Please try again.",
              sender: 'ai',
              timestamp: new Date().toISOString()
            }
          ];
        }
        return [
          ...prev,
          {
            id: uuidv4(),
            content: "I'm sorry, I encountered an error generating a focus prompt. Please try again.",
            sender: 'ai',
            timestamp: new Date().toISOString()
          }
        ];
      });
    } finally {
      setIsTyping(false);
      setIsProcessing(false);
    }
  };

  // Summarize notes
  const handleSummarizeNotes = async () => {
    if (notes.length === 0) {
      toast({
        title: "No notes to summarize",
        description: "You don't have any notes to summarize yet.",
        variant: "destructive"
      });
      return;
    }
    
    setIsTyping(true);
    setIsProcessing(true);
    
    // Create a summary of the notes content
    const notesContent = notes.map(note => 
      `# ${note.title}\n${note.content}`
    ).join('\n\n');
    
    try {
      // Initialize response message with empty content
      setMessages(prev => [
        ...prev,
        {
          id: uuidv4(),
          content: '',
          sender: 'ai',
          timestamp: new Date().toISOString()
        }
      ]);

      await streamChatCompletion(
        [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Here are my notes. Please summarize the key points and main ideas:\n\n${notesContent}` }
        ],
        handleStreamChunk
      );
      
      toast({
        title: "Notes Summarized",
        description: "A summary of your notes has been created."
      });
    } catch (error) {
      console.error("Error summarizing notes:", error);
      
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last.sender === 'ai' && last.content === '') {
          return [
            ...prev.slice(0, -1),
            {
              id: uuidv4(),
              content: "I'm sorry, I encountered an error summarizing your notes. Please try again.",
              sender: 'ai',
              timestamp: new Date().toISOString()
            }
          ];
        }
        return [
          ...prev,
          {
            id: uuidv4(),
            content: "I'm sorry, I encountered an error summarizing your notes. Please try again.",
            sender: 'ai',
            timestamp: new Date().toISOString()
          }
        ];
      });
    } finally {
      setIsTyping(false);
      setIsProcessing(false);
    }
  };

  // Save AI response as a note
  const handleSaveAsNote = (content: string) => {
    // Extract a title from the content (first few words)
    const titleMatch = content.match(/^# (.+)$/m) || content.match(/^(.{1,50})\b/);
    const title = titleMatch ? titleMatch[1] : 'AI Generated Note';
    
    // Create a new note
    const newNote = addNote({
      title,
      content,
      isPinned: false,
      tags: []
    });
    
    toast({
      title: "Note Created",
      description: `"${title}" has been added to your notes.`
    });
    
    return newNote;
  };

  // Generate image
  const handleGenerateImage = async () => {
    if (!imagePrompt.trim() || isProcessing) {
      toast({
        title: "No prompt provided",
        description: "Please enter a description for the image you want to generate.",
        variant: "destructive"
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Create request for image
      const prompt = imagePrompt;
      const { width, height } = imageSize;
      const seed = Math.floor(Math.random() * 1000); // Random seed for each generation
      
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}&seed=${seed}&noLogo=${API_CONFIG.noLogo}&model=${API_CONFIG.imageModel}`;
      
      // Add image message
      const imageMessage: Message = {
        id: uuidv4(),
        content: `Generated image for prompt: "${prompt}"`,
        sender: 'ai',
        timestamp: new Date().toISOString(),
        imageUrl: imageUrl
      };
      
      setMessages(prev => [...prev, imageMessage]);
      setImagePrompt('');
      setShowImagePrompt(false);
      
      toast({
        title: "Image Generated",
        description: "Your image has been generated."
      });
    } catch (error) {
      console.error("Error generating image:", error);
      
      toast({
        title: "Image Generation Failed",
        description: "There was an error generating your image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-card relative overflow-hidden">
      {/* Cosmic background effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-30">
          {Array.from({ length: 30 }).map((_, i) => (
            <div 
              key={i}
              className="star absolute animate-pulse"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 2 + 1}px`,
                height: `${Math.random() * 2 + 1}px`,
                backgroundColor: 'currentColor',
                borderRadius: '50%',
                animationDuration: `${Math.random() * 3 + 1}s`,
              }}
            />
          ))}
        </div>
      </div>
      
      <div className="p-4 border-b border-border/50 backdrop-blur-sm bg-card/30 flex items-center gap-2 z-10">
        <MessageSquare className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold">AI Assistant</h2>
        <div className="ml-auto px-2 py-1 text-xs bg-primary/20 rounded-full text-primary font-mono">
          GPT-4.1
        </div>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4 z-10" style={{ fontFamily: 'Poppins, sans-serif' }}>
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl ${
                message.sender === 'user'
                  ? 'bg-gradient-to-r from-primary to-primary/80 text-white cosmic-glow'
                  : 'bg-secondary/80 backdrop-blur-md text-secondary-foreground'
              }`}
            >
              <div className="prose prose-sm dark:prose-invert">
                {message.content.split('\n').map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    {i !== message.content.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
                
                {message.imageUrl && (
                  <div className="mt-3">
                    <img 
                      src={message.imageUrl} 
                      alt="Generated" 
                      className="max-w-full rounded-md shadow-lg border border-border/50"
                    />
                    <div className="flex justify-end mt-2">
                      <a 
                        href={message.imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline"
                        download
                      >
                        Download Image
                      </a>
                    </div>
                  </div>
                )}
              </div>
              
              {message.sender === 'ai' && message.content && (
                <div className="flex justify-end mt-2 gap-2">
                  <button
                    onClick={() => handleSaveAsNote(message.content)}
                    className="text-xs text-primary/70 hover:text-primary flex items-center gap-1 transition-colors"
                  >
                    <FileText className="w-3 h-3" /> Save as note
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-secondary/80 backdrop-blur-sm text-secondary-foreground px-4 py-2 rounded-lg shadow-lg">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
                <div className="w-2 h-2 rounded-full bg-current animate-pulse" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 rounded-full bg-current animate-pulse" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 border-t border-border/50 bg-card/70 backdrop-blur-md z-10">
        <div className="flex flex-wrap gap-2 mb-3">
          <Button
            variant="cosmic"
            size="sm"
            onClick={handleGenerateFocusPrompt}
            disabled={isProcessing}
            className="text-xs gap-1 transition-all hover:scale-105 btn-glow"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L7 7.5V13l-2 1.5L10 21.5l5-7 5 7 5-7-5-7 5-7L12 2z"/></svg>
            Generate Focus Prompt
          </Button>
          <Button
            variant="cosmic"
            size="sm"
            onClick={handleSummarizeNotes}
            disabled={isProcessing}
            className="text-xs gap-1 transition-all hover:scale-105 btn-glow"
          >
            <FileText className="w-3 h-3" />
            Summarize Notes
          </Button>
          <Button
            variant="cosmic"
            size="sm"
            onClick={() => setShowImagePrompt(!showImagePrompt)}
            disabled={isProcessing}
            className="text-xs gap-1 transition-all hover:scale-105 btn-glow"
          >
            <ImageIcon className="w-3 h-3" />
            Generate Image
          </Button>
        </div>

        {showImagePrompt && (
          <div className="mb-3 p-3 border border-border/50 rounded-md bg-background/50 backdrop-blur-sm animate-slide-down">
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <Textarea
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  placeholder="Describe the image you want to generate..."
                  className="resize-none flex-1 bg-background/50"
                  rows={2}
                />
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={handleGenerateImage}
                    disabled={isProcessing || !imagePrompt.trim()}
                    size="sm"
                    className="cosmic-glow"
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => setShowImagePrompt(false)}
                    variant="outline"
                    size="sm"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="flex gap-4 items-center text-xs">
                <div className="flex gap-2 items-center">
                  <span className="text-muted-foreground">Size:</span>
                  <select 
                    value={`${imageSize.width}x${imageSize.height}`}
                    onChange={(e) => {
                      const [width, height] = e.target.value.split('x').map(Number);
                      setImageSize({ width, height });
                    }}
                    className="bg-background/50 border border-border/50 rounded p-1"
                  >
                    <option value="512x512">512 × 512</option>
                    <option value="768x768">768 × 768</option>
                    <option value="1024x1024">1024 × 1024</option>
                    <option value="1024x768">1024 × 768</option>
                    <option value="768x1024">768 × 1024</option>
                  </select>
                </div>
                <div className="text-muted-foreground">
                  Model: <span className="text-primary font-mono">flux</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex gap-2">
          <Textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            className="resize-none bg-background/50 border-border/50 focus:border-primary transition-colors"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={isProcessing || !inputMessage.trim()}
            className="cosmic-glow transition-transform hover:scale-105"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AiAssistant;
