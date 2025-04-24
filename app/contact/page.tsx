export default function ContactPage() {
  return (
    <main className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
      <p className="mb-6">
        Have questions or feedback? We'd love to hear from you. Fill out the form below and we'll get back to you as soon as possible.
      </p>
      
      <form className="max-w-lg">
        <div className="mb-4">
          <label htmlFor="name" className="block mb-2">Name</label>
          <input 
            type="text" 
            id="name" 
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Your name"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="email" className="block mb-2">Email</label>
          <input 
            type="email" 
            id="email" 
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Your email"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="message" className="block mb-2">Message</label>
          <textarea 
            id="message" 
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Your message"
          />
        </div>
        
        <button 
          type="submit" 
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Send Message
        </button>
      </form>
    </main>
  )
}