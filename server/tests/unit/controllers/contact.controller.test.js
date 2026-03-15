
// Use vi.hoisted so the shared variable is defined before vi.mock factories run.
// Uses the real Contact module + vi.spyOn — the reliable CJS Vitest pattern.
// vi.mock factory with constructor mocking is unreliable in CJS mode because the
// module cache is shared; vi.spyOn works because it patches the same cached object.

const Contact = require("../../../models/contact.model");
const {
  submitContactForm,
  getAllContacts,
  deleteContactById,
} = require("../../../controllers/contact.controller");

function makeRes() {
  const json = vi.fn();
  const res = { status: vi.fn(() => res), json };
  return res;
}

describe("contact.controller – submitContactForm", () => {
  let saveSpy;

  beforeEach(() => {
    saveSpy = vi.spyOn(Contact.prototype, "save");
  });

  afterEach(() => {
    saveSpy.mockRestore();
  });

  it("returns 400 when any field is missing", async () => {
    const req = { body: { firstName: "John" } };
    const res = makeRes();
    await submitContactForm(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "All fields are required." })
    );
  });

  it("returns 201 on successful submission", async () => {
    saveSpy.mockResolvedValue({});
    const req = {
      body: {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        subject: "Hello",
        message: "Test message",
      },
    };
    const res = makeRes();
    await submitContactForm(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("returns 500 on DB error", async () => {
    saveSpy.mockRejectedValue(new Error("DB failure"));
    const req = {
      body: {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        subject: "Hello",
        message: "Test message",
      },
    };
    const res = makeRes();
    await submitContactForm(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("contact.controller – getAllContacts", () => {
  let findSpy;

  beforeEach(() => {
    findSpy = vi.spyOn(Contact, "find");
  });

  afterEach(() => {
    findSpy.mockRestore();
  });

  it("returns all contacts", async () => {
    const contacts = [{ _id: "c1" }, { _id: "c2" }];
    findSpy.mockReturnValue({ sort: vi.fn().mockResolvedValue(contacts) });
    const req = {};
    const res = makeRes();
    await getAllContacts(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(contacts);
  });

  it("returns 500 on DB error", async () => {
    findSpy.mockReturnValue({
      sort: vi.fn().mockRejectedValue(new Error("DB down")),
    });
    const res = makeRes();
    await getAllContacts({}, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("contact.controller – deleteContactById", () => {
  let deleteSpy;

  beforeEach(() => {
    deleteSpy = vi.spyOn(Contact, "findByIdAndDelete");
  });

  afterEach(() => {
    deleteSpy.mockRestore();
  });

  it("deletes contact and returns 200", async () => {
    deleteSpy.mockResolvedValue({ _id: "c1" });
    const req = { params: { id: "c1" } };
    const res = makeRes();
    await deleteContactById(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(deleteSpy).toHaveBeenCalledWith("c1");
  });

  it("returns 500 on DB error", async () => {
    deleteSpy.mockRejectedValue(new Error("DB error"));
    const res = makeRes();
    await deleteContactById({ params: { id: "bad-id" } }, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
