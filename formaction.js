import { useActionState } from "react";

// ── Types ─────────────────────────────────────────────────
type FormState = {
  status: "idle" | "error" | "success";
  message: string;
  fields?: {           // preserve field values on error
    name: string;
    email: string;
    country: string;
  };
};

// ── Initial state ─────────────────────────────────────────
const initialState: FormState = {
  status: "idle",
  message: "",
};

// ── Action function (runs on submit) ──────────────────────
async function formAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const name    = formData.get("name")    as string;
  const email   = formData.get("email")   as string;
  const country = formData.get("country") as string;

  // ── Validation ──────────────────────────────────────────
  if (!name || !email || !country) {
    return {
      status: "error",
      message: "All fields are required.",
      fields: { name, email, country }, // send back values so inputs don't clear
    };
  }

  // ── Simulate async request ──────────────────────────────
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // ── Success — no fields returned so inputs reset ────────
  return {
    status: "success",
    message: `Welcome ${name}! Your form was submitted successfully.`,
  };
}

// ── App ───────────────────────────────────────────────────
export default function App() {
  const [state, action, isPending] = useActionState(formAction, initialState);

  return (
    <main className="py-24 min-h-dvh bg-gray-100 p-4">
      <div className="flex flex-col gap-8 items-center w-full max-w-xl mx-auto shadow-2xl p-8 bg-white rounded-2xl">
        <h1 className="text-4xl font-bold text-center">
          Form with useActionState
        </h1>

        <form action={action} className="flex flex-col gap-8 min-w-sm w-full">
          <Input
            label="Name"
            name="name"
            type="text"
            key={state.status === "success" ? "reset-name" : "name"}
            defaultValue={state.fields?.name ?? ""}
          />
          <Input
            label="Email"
            name="email"
            type="email"
            key={state.status === "success" ? "reset-email" : "email"}
            defaultValue={state.fields?.email ?? ""}
          />
          <Input
            label="Country"
            name="country"
            type="text"
            key={state.status === "success" ? "reset-country" : "country"}
            defaultValue={state.fields?.country ?? ""}
          />

          {/* ── Submit button ──────────────────────────── */}
          <button
            type="submit"
            disabled={isPending}
            className="bg-teal-500 text-white px-6 py-2 rounded-xl hover:bg-teal-600
                       self-end cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors"
          >
            {isPending ? "Submitting..." : "Submit"}
          </button>

          {/* ── Error message ──────────────────────────── */}
          {state.status === "error" && (
            <p className="text-red-500 text-sm">{state.message}</p>
          )}

          {/* ── Success message ────────────────────────── */}
          {state.status === "success" && (
            <p className="text-green-500 text-sm">{state.message}</p>
          )}
        </form>
      </div>
    </main>
  );
}

// ── Reusable Input component ──────────────────────────────
type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export function Input({ label, ...props }: InputProps) {
  return (
    <label className="block text-sm font-medium text-gray-600">
      <span className="font-semibold mb-2 block">{label}</span>
      <input
        {...props}
        className="w-full font-light rounded-xl border-gray-300 border shadow-sm px-4 py-2"
      />
    </label>
  );
}