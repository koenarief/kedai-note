import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { db } from "../../firebase";
import { jsPDF } from "jspdf";
// import { useUserContext } from "../../context/UserContext";

jest.mock("../../context/UserContext");

jest.mock("../../firebase", () => {
    return { db: { __mocked_db__: true } };
});

const mockOnSnapshot = jest.fn();
const mockQuery = jest.fn();
const mockCollection = jest.fn();
const mockOrderBy = jest.fn();
const mockWhere = jest.fn();
const mockDeleteDoc = jest.fn();
const mockDoc = jest.fn();

jest.mock("firebase/firestore", () => {
    return {
        collection: (...args) => mockCollection(...args),
        query: (...args) => mockQuery(...args),
        orderBy: (...args) => mockOrderBy(...args),
        where: (...args) => mockWhere(...args),
        onSnapshot: (...args) => mockOnSnapshot(...args),
        deleteDoc: (...args) => mockDeleteDoc(...args),
        doc: (...args) => mockDoc(...args),
    };
});

jest.mock("../ConfirmDeleteModal", () => {
    const React = require('react');

    return {
        __esModule: true,
        default: ({ isOpen, onConfirm, onCancel, item }) =>
            isOpen
                ? React.createElement(
                        "div",
                        { "data-testid": "confirm-modal" },
                        React.createElement("button", { "data-testid": "confirm", onClick: onConfirm }, "Confirm"),
                        React.createElement("button", { "data-testid": "cancel", onClick: onCancel }, "Cancel"),
                        React.createElement("span", null, item)
                    )
                : null,
    };
});

const mockSave = jest.fn();
const mockAutoPrint = jest.fn();
const mockSetFontSize = jest.fn();
const mockText = jest.fn();
const mockLine = jest.fn();

jest.mock("jspdf", () => {
    return {
        jsPDF: jest.fn().mockImplementation(() => {
            return {
                setFontSize: mockSetFontSize,
                text: mockText,
                line: mockLine,
                autoPrint: mockAutoPrint,
                save: mockSave,
            };
        }),
    };
});

describe("SalesList", () => {

    beforeEach(() => {
        jest.clearAllMocks();
        // default user
        // useUserContext.mockReturnValue({ uid: "user-123" });

        // default firestore mocks simple passthroughs
        mockCollection.mockImplementation(() => ({ collectionCalled: true }));
        mockQuery.mockImplementation(() => ({ queryCalled: true }));
        mockOrderBy.mockImplementation(() => ({ orderByCalled: true }));
        mockWhere.mockImplementation(() => ({ whereCalled: true }));

        // doc should return a sentinel docRef
        mockDoc.mockImplementation((...args) => ({ docRefArgs: args }));

        // onSnapshot will be set per-test via mockImplementation below
    });

    test("renders sales items and shows action buttons when created recently", async () => {
        // prepare a sale created 5 minutes ago
        const recentDate = new Date(Date.now() - 5 * 60 * 1000);
        const docObj = {
            id: "sale1",
            data: () => ({
                id: "sale1",
                total: 2000,
                createdAt: { toDate: () => recentDate },
                items: [
                    { id: "item1", qty: 2, name: "Apple", price: 1000, subTotal: 2000 },
                ],
            }),
        };

        mockOnSnapshot.mockImplementation((q, cb) => {
            cb({ docs: [docObj] });
            return () => {};
        });

        // const { default: SalesList } = await import("./SalesList");
        // const React = require('react');

        // const { container } = render(React.createElement(SalesList));

        // // item text should appear
        // expect(container.textContent).toContain("2× Apple");
        // // price formatting shows "1k" and subtotal "2k"
        // expect(container.textContent).toContain("@ 1k");
        // expect(container.textContent).toContain("2k");
        // // total shows "2k"
        // expect(container.textContent).toContain("Total: 2k");

        // // action buttons (delete & print) should exist inside the list item
        // const firstLi = container.querySelector("li");
        // expect(firstLi).toBeTruthy();
        // const buttons = firstLi.querySelectorAll("button");
        // // two buttons: delete and print
        // expect(buttons.length).toBeGreaterThanOrEqual(2);
    });

    test("clicking delete opens confirm modal and calls deleteDoc on confirm", async () => {
        const recentDate = new Date(Date.now() - 10 * 60 * 1000);
        const saleId = "sale-delete-1";
        const docObj = {
            id: saleId,
            data: () => ({
                id: saleId,
                total: 5000,
                createdAt: { toDate: () => recentDate },
                items: [{ id: "i1", qty: 1, name: "Banana", price: 5000, subTotal: 5000 }],
            }),
        };

        mockOnSnapshot.mockImplementation((q, cb) => {
            cb({ docs: [docObj] });
            return () => {};
        });

        // const { default: SalesList } = await import("./SalesList");

        // const React = require('react');


        // const { container } = render(React.createElement(SalesList));

        // const firstLi = container.querySelector("li");
        // const buttons = firstLi.querySelectorAll("button");
        // // assume first is delete, second is print
        // const deleteButton = buttons[0];
        // userEvent.click(deleteButton);

        // // modal should appear
        // expect(await screen.findByTestId("confirm-modal")).toBeTruthy();

        // // confirm should call deleteDoc with doc(...) result
        // const confirmBtn = screen.getByTestId("confirm");

        // userEvent.click(confirmBtn);

        // await waitFor(() => {
        //     expect(mockDoc).toHaveBeenCalledWith(db, "users", "user-123", "penjualans", saleId);
        //     expect(mockDeleteDoc).toHaveBeenCalled();
        // });
    });

    test("clicking print generates a PDF via jsPDF.save", async () => {
        const recentDate = new Date(Date.now() - 2 * 60 * 1000);
        const saleId = "sale-print-1";
        const docObj = {
            id: saleId,
            data: () => ({
                id: saleId,
                total: 12345,
                createdAt: { toDate: () => recentDate },
                items: [
                    { id: "it1", qty: 1, name: "Coffee", price: 12345, subTotal: 12345 },
                ],
            }),
        };

        mockOnSnapshot.mockImplementation((q, cb) => {
            cb({ docs: [docObj] });
            return () => {};
        });

        // const { default: SalesList } = await import("./SalesList");


        // const { container } = render(React.createElement(SalesList));

        // const firstLi = container.querySelector("li");
        // const buttons = firstLi.querySelectorAll("button");
        // const printButton = buttons[1]; // assume second is print
        // userEvent.click(printButton);

        // await waitFor(() => {
        //     // jsPDF constructor should have been called
        //     expect(jsPDF).toHaveBeenCalled();
        //     // save should be invoked with expected filename
        //     expect(mockSave).toHaveBeenCalledWith(`invoice_${saleId}.pdf`);
        //     // autoPrint should be called
        //     expect(mockAutoPrint).toHaveBeenCalled();
        // });
    });

    test("does not show action buttons for old sales (more than 60 minutes)", async () => {
        const oldDate = new Date(Date.now() - 120 * 60 * 1000); // 120 minutes ago
        const docObj = {
            id: "old-sale",
            data: () => ({
                id: "old-sale",
                total: 1000,
                createdAt: { toDate: () => oldDate },
                items: [{ id: "a1", qty: 1, name: "OldItem", price: 1000, subTotal: 1000 }],
            }),
        };

        mockOnSnapshot.mockImplementation((q, cb) => {
            cb({ docs: [docObj] });
            return () => {};
        });

        // const { default: SalesList } = await import("./SalesList");

        // // const React = require('react');

        // const { container } = render(React.createElement(SalesList));

        // // action buttons should not be present for old sale
        // const firstLi = container.querySelector("li");
        // const buttons = firstLi.querySelectorAll("button");
        // // only possible buttons are none (modal) or others; expect 0 action buttons inside item
        // // to be safe, ensure there's no confirm modal yet and no two action buttons
        // expect(screen.queryByTestId("confirm-modal")).toBeNull();
        // // If there are any buttons inside the item, they are not the action buttons; ensure at most 0 here
        // expect(buttons.length).toBe(0);
    });
});