import { ErrorContent } from "./ErrorContent";

function NotFoundPage() {
  return (
    <main className="flex relative flex-col w-full h-screen bg-stone-950 overflow-hidden">
      <div className="flex relative z-10 flex-col flex-1 h-full">
        <ErrorContent />
      </div>
    </main>
  );
}

export default NotFoundPage;
