import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import FitnessChatBot from "./FitnessChatBot";

describe("FitnessChatBot", () => {
	beforeEach(() => {
		Element.prototype.scrollIntoView = vi.fn();

		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue({
				ok: true,
				json: async () => ({ reply: "Try progressive overload and rest." }),
			}),
		);

		Object.defineProperty(window, "matchMedia", {
			writable: true,
			value: vi.fn().mockImplementation(() => ({
				matches: false,
				media: "",
				onchange: null,
				addListener: vi.fn(),
				removeListener: vi.fn(),
				addEventListener: vi.fn(),
				removeEventListener: vi.fn(),
				dispatchEvent: vi.fn(),
			})),
		});
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
	});

	it("opens chat and shows welcome message", async () => {
		const user = userEvent.setup();
		render(<FitnessChatBot />);

		await user.click(screen.getByRole("button", { name: /open fitness assistant/i }));

		expect(screen.getByRole("dialog", { name: /fitness assistant/i })).toBeInTheDocument();
		expect(
			screen.getByText(/hello! i'm your fitmart fitness assistant/i),
		).toBeInTheDocument();
	});

	it("sends a quick reply and renders bot response", async () => {
		const user = userEvent.setup();
		render(<FitnessChatBot />);

		await user.click(screen.getByRole("button", { name: /open fitness assistant/i }));
		await user.click(screen.getByRole("button", { name: /build muscle/i }));

		expect(
			await screen.findByRole("article", {
				name: /you: how can i build muscle effectively\?/i,
			}),
		).toBeInTheDocument();
		expect(
			await screen.findByRole("article", {
				name: /fitness assistant: try progressive overload and rest\./i,
			}),
		).toBeInTheDocument();

		await waitFor(() => {
			expect(globalThis.fetch).toHaveBeenCalledTimes(1);
		});
	});

	it("shows fallback message when request fails", async () => {
		const user = userEvent.setup();
		globalThis.fetch.mockRejectedValueOnce(new Error("network down"));

		render(<FitnessChatBot />);
		await user.click(screen.getByRole("button", { name: /open fitness assistant/i }));
		await user.click(screen.getByRole("button", { name: /diet plan/i }));

		expect(
			await screen.findByRole("article", {
				name: /fitness assistant: sorry, i couldn't connect right now\. please try again\./i,
			}),
		).toBeInTheDocument();
	});
});
