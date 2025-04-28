export default function ContactPage() {
  return (
    <main className="container mx-auto px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold">Contact Us</h1>
      <p className="mb-6">
        Have questions or feedback? We'd love to hear from you. Fill out the form below and we'll get back to you as
        soon as possible.
      </p>

      <form className="max-w-lg">
        <div className="mb-4">
          <label htmlFor="name" className="mb-2 block">
            Name
          </label>
          <input
            type="text"
            id="name"
            className="w-full rounded-md border border-gray-300 px-3 py-2"
            placeholder="Your name"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="email" className="mb-2 block">
            Email
          </label>
          <input
            type="email"
            id="email"
            className="w-full rounded-md border border-gray-300 px-3 py-2"
            placeholder="Your email"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="message" className="mb-2 block">
            Message
          </label>
          <textarea
            id="message"
            rows={4}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
            placeholder="Your message"
          />
        </div>

        <button type="submit" className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          Send Message
        </button>
      </form>
    </main>
  )
}
