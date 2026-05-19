export const metadata = {
  title: "Check your email — Seven Generation Learning",
};

export default function CheckEmailPage() {
  return (
    <div className="flex flex-1 items-center justify-center bg-cream px-6 py-12">
      <div className="w-full max-w-md text-center">
        <div className="label-mono mb-3">Seven Generation / Learning</div>
        <h1 className="heading-serif text-4xl text-navy">Check your email.</h1>
        <p className="mt-4 text-base text-muted">
          We sent a sign-in link to your inbox. It&rsquo;s good for 24 hours and
          only works once.
        </p>
        <p className="mt-8 text-sm text-muted">
          Didn&rsquo;t arrive in a minute or two? Check spam, or{" "}
          <a href="/login" className="text-gold underline-offset-4 hover:underline">
            try a different email
          </a>
          .
        </p>
      </div>
    </div>
  );
}
