/** @jest-environment jsdom */

import React from "react";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
// import "@testing-library/jest-dom/extend-expect";
import '@testing-library/jest-dom'

import ImageUploader from "./ImageUploader";
import { uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useAuthState } from "react-firebase-hooks/auth";

// We recommend installing an extension to run jest tests.


jest.mock("firebase/storage", () => ({
    ref: jest.fn(),
    uploadBytesResumable: jest.fn(),
    getDownloadURL: jest.fn(),
}));

jest.mock("../firebase", () => ({
    auth: {},
    storage: {},
}));

jest.mock("react-firebase-hooks/auth", () => ({
    useAuthState: jest.fn(),
}));

jest.mock("./LiveCameraCapture", () => {
    return {
        __esModule: true,
        default: ({ onCancel, onConfirm }) => (
            <div data-testid="live-camera">
                <button onClick={onCancel}>Cancel</button>
                <button onClick={() => onConfirm("camera-url")}>Confirm</button>
            </div>
        ),
    };
});

jest.mock("lucide-react", () => ({
    File: () => <span data-testid="file-icon">F</span>,
    Camera: () => <span data-testid="camera-icon">C</span>,
}));


describe("ImageUploader", () => {
    let setImageUrl;

    // holder for the callbacks provided to uploadTask.on
    let uploadCallbacks;

    beforeEach(() => {
        // mock authenticated user
        useAuthState.mockReturnValue([{ uid: "user123" }]);

        // reset captured callbacks
        uploadCallbacks = null;

        // mock uploadBytesResumable to capture callbacks
        uploadBytesResumable.mockImplementation(() => {
            const callbacks = {};
            uploadCallbacks = callbacks;
            return {
                on: (state, progressCb, errorCb, completeCb) => {
                    callbacks.progressCb = progressCb;
                    callbacks.errorCb = errorCb;
                    callbacks.completeCb = completeCb;
                },
                snapshot: { ref: {} },
            };
        });

        // default getDownloadURL
        getDownloadURL.mockResolvedValue("http://download-url");

        setImageUrl = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("renders provided imageUrl as preview", () => {
        render(<ImageUploader imageUrl="http://img" setImageUrl={setImageUrl} />);
        const img = screen.getByAltText("Uploaded Preview");
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute("src", "http://img");
    });

    test("clicking file button triggers hidden file input click", () => {
        const { container } = render(<ImageUploader imageUrl="" setImageUrl={setImageUrl} />);
        const input = container.querySelector("#imageUpload");
        expect(input).toBeInTheDocument();
        const clickSpy = jest.spyOn(input, "click");
        const buttons = container.querySelectorAll("button");
        // first button is file button
        fireEvent.click(buttons[0]);
        expect(clickSpy).toHaveBeenCalled();
    });

    test("selecting a file uploads and calls setImageUrl on completion", async () => {
        const { container } = render(<ImageUploader imageUrl="" setImageUrl={setImageUrl} />);
        const input = container.querySelector("#imageUpload");

        const file = new File(["dummy"], "test.png", { type: "image/png" });

        // simulate user selecting file
        await act(async () => {
            fireEvent.change(input, { target: { files: [file] } });
        });

        // simulate progress
        await act(async () => {
            uploadCallbacks.progressCb({ bytesTransferred: 50, totalBytes: 100 });
        });

        expect(screen.getByText(/Mengunggah\.\.\. \(50%/)).toBeInTheDocument();

        // simulate completion
        await act(async () => {
            uploadCallbacks.completeCb();
            // wait for the getDownloadURL promise to resolve and setImageUrl to be called
            await waitFor(() => expect(setImageUrl).toHaveBeenCalledWith("http://download-url"));
        });

        // after completion progress UI should disappear
        await waitFor(() => expect(screen.queryByText(/Mengunggah\.\.\./)).not.toBeInTheDocument());
    });

    test("shows error message when upload fails", async () => {
        const { container } = render(<ImageUploader imageUrl="" setImageUrl={setImageUrl} />);
        const input = container.querySelector("#imageUpload");
        const file = new File(["dummy"], "err.png", { type: "image/png" });

        await act(async () => {
            fireEvent.change(input, { target: { files: [file] } });
        });

        // simulate upload error
        await act(async () => {
            uploadCallbacks.errorCb(new Error("network"));
        });

        expect(screen.getByText("Gagal mengunggah file. Silakan coba lagi.")).toBeInTheDocument();
    });

    test("camera button opens LiveCameraCapture and confirm sets image url", async () => {
        render(<ImageUploader imageUrl="" setImageUrl={setImageUrl} />);
        const buttons = screen.getAllByRole("button");
        // second button is camera button
        fireEvent.click(buttons[1]);

        const live = screen.getByTestId("live-camera");
        expect(live).toBeInTheDocument();

        const confirmBtn = screen.getByText("Confirm");
        fireEvent.click(confirmBtn);

        expect(setImageUrl).toHaveBeenCalledWith("camera-url");
    });
});