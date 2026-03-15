import { getCroppedImg } from "../../../utils/cropImage";

describe("cropImage utility", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    delete global.Image;
    delete global.document;
  });

  it("returns null when canvas context is unavailable", async () => {
    global.Image = class {
      constructor() {
        this.width = 100;
        this.height = 100;
        this.listeners = {};
      }
      addEventListener(event, callback) {
        this.listeners[event] = callback;
      }
      setAttribute() {}
      set src(_) {
        this.listeners.load();
      }
    };

    global.document = {
      createElement: vi.fn().mockReturnValue({
        getContext: vi.fn().mockReturnValue(null),
      }),
    };

    const result = await getCroppedImg("mock-image", {
      x: 0,
      y: 0,
      width: 10,
      height: 10,
    });

    expect(result).toBeNull();
  });

  it("returns jpeg data URL when context operations succeed", async () => {
    global.Image = class {
      constructor() {
        this.width = 100;
        this.height = 100;
        this.listeners = {};
      }
      addEventListener(event, callback) {
        this.listeners[event] = callback;
      }
      setAttribute() {}
      set src(_) {
        this.listeners.load();
      }
    };

    const ctx = {
      translate: vi.fn(),
      rotate: vi.fn(),
      scale: vi.fn(),
      drawImage: vi.fn(),
      getImageData: vi.fn().mockReturnValue({ data: [] }),
      putImageData: vi.fn(),
    };

    const canvas = {
      width: 0,
      height: 0,
      getContext: vi.fn().mockReturnValue(ctx),
      toDataURL: vi.fn().mockReturnValue("data:image/jpeg;base64,mock"),
    };

    global.document = {
      createElement: vi.fn().mockReturnValue(canvas),
    };

    const result = await getCroppedImg(
      "mock-image",
      { x: 1, y: 2, width: 20, height: 30 },
      90,
      { horizontal: true, vertical: false }
    );

    expect(ctx.drawImage).toHaveBeenCalled();
    expect(ctx.getImageData).toHaveBeenCalledWith(1, 2, 20, 30);
    expect(canvas.toDataURL).toHaveBeenCalledWith("image/jpeg");
    expect(result).toBe("data:image/jpeg;base64,mock");
  });
});
