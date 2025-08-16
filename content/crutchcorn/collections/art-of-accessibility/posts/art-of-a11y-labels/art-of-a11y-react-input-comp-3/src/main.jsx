import { createRoot } from "react-dom/client";
import { useId } from "react";
import styles from "./main.module.css";

export const TextInput = ({ label, type, id, error }) => {
	const _id = useId();

	const realId = id || uuid;

	return (
		<>
			<label for={realId} className={styles.label}>
				{label}
			</label>
			<input
				id={id}
				type={type}
				aria-invalid={!!error}
				aria-errormessage={id + "-error"}
			/>
			<p className={styles.errormessage} id={realId + "-error"}>
				{error}
			</p>
		</>
	);
};

export const App = () => {
	return (
		<form>
			<TextInput label="Email" id="email" error="Invalid email" />
			<TextInput label="Password" type="password" />
			<button type="submit">Login</button>
		</form>
	);
};

createRoot(document.getElementById("root")).render(<App />);
