/**
 * Simple Image Tool for Editor.js
 * Displays images and allows updating via external modal
 */

export default class SimpleImageTool {
  constructor({ data, config, api, readOnly, block }) {
    this.api = api;
    this.readOnly = readOnly;
    this.block = block;
    this.config = config || {};
    
    this.data = {
      url: data.url || "",
      caption: data.caption || "",
      withBorder: data.withBorder || false,
      withBackground: data.withBackground || false,
      stretched: data.stretched || false,
    };
    
    this.wrapper = null;
    this.imageEl = null;
    this.captionEl = null;
    
    // Store reference for external updates
    this._blockIndex = null;
  }

  static get toolbox() {
    return {
      title: "Image",
      icon: `<svg width="17" height="15" viewBox="0 0 336 276" xmlns="http://www.w3.org/2000/svg"><path d="M291 150V79c0-19-15-34-34-34H79c-19 0-34 15-34 34v42l67-44 81 72 56-29 42 30zm0 52l-43-30-56 30-81-67-66 39v23c0 19 15 34 34 34h178c17 0 31-13 34-29zM79 0h178c44 0 79 35 79 79v118c0 44-35 79-79 79H79c-44 0-79-35-79-79V79C0 35 35 0 79 0z"/></svg>`,
    };
  }

  static get enableLineBreaks() {
    return true;
  }

  render() {
    this.wrapper = document.createElement("div");
    this.wrapper.classList.add("simple-image-tool");
    this.wrapper.style.cssText = "width: 100%;";
    
    if (this.data.url && this.data.url.startsWith("http")) {
      this._renderImage();
    } else {
      this._renderPlaceholder();
    }
    
    return this.wrapper;
  }

  _renderPlaceholder() {
    this.wrapper.innerHTML = "";
    
    const placeholder = document.createElement("div");
    placeholder.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      border: 2px dashed #ccc;
      border-radius: 8px;
      cursor: pointer;
      background: #f8f9fa;
      transition: all 0.2s;
    `;
    
    placeholder.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 336 276" style="fill: #666; margin-bottom: 8px;">
        <path d="M291 150V79c0-19-15-34-34-34H79c-19 0-34 15-34 34v42l67-44 81 72 56-29 42 30zm0 52l-43-30-56 30-81-67-66 39v23c0 19 15 34 34 34h178c17 0 31-13 34-29zM79 0h178c44 0 79 35 79 79v118c0 44-35 79-79 79H79c-44 0-79-35-79-79V79C0 35 35 0 79 0z"/>
      </svg>
      <span style="font-size: 14px; font-weight: 500; color: #333;">Click to Select Image</span>
      <small style="font-size: 12px; color: #666; margin-top: 4px;">Upload, paste URL, or choose from library</small>
    `;
    
    placeholder.addEventListener("mouseenter", () => {
      placeholder.style.borderColor = "#007bff";
      placeholder.style.background = "#f0f7ff";
    });
    
    placeholder.addEventListener("mouseleave", () => {
      placeholder.style.borderColor = "#ccc";
      placeholder.style.background = "#f8f9fa";
    });
    
    if (!this.readOnly && this.config.onSelectImage) {
      placeholder.addEventListener("click", () => {
        const blockIndex = this.api.blocks.getCurrentBlockIndex();
        this.config.onSelectImage(blockIndex, this);
      });
    }
    
    this.wrapper.appendChild(placeholder);
  }

  _renderImage() {
    this.wrapper.innerHTML = "";
    
    const container = document.createElement("div");
    container.style.cssText = "text-align: center;";
    
    this.imageEl = document.createElement("img");
    this.imageEl.src = this.data.url;
    this.imageEl.alt = this.data.caption || "Image";
    this.imageEl.style.cssText = `
      max-width: 100%;
      height: auto;
      border-radius: 4px;
      ${this.data.withBorder ? "border: 1px solid #ccc;" : ""}
      ${this.data.stretched ? "width: 100%;" : ""}
      ${this.data.withBackground ? "background: #f0f0f0; padding: 10px;" : ""}
    `;
    
    this.imageEl.addEventListener("error", () => {
      this.imageEl.style.display = "none";
      const error = document.createElement("div");
      error.textContent = "Failed to load image";
      error.style.cssText = "padding: 20px; background: #fee; color: #c00; border-radius: 4px;";
      container.appendChild(error);
    });
    
    container.appendChild(this.imageEl);
    
    // Caption
    this.captionEl = document.createElement("div");
    this.captionEl.contentEditable = !this.readOnly;
    this.captionEl.innerHTML = this.data.caption || "";
    this.captionEl.dataset.placeholder = "Add a caption...";
    this.captionEl.style.cssText = `
      margin-top: 8px;
      padding: 8px;
      text-align: center;
      font-size: 14px;
      color: ${this.data.caption ? "#333" : "#999"};
      outline: none;
      min-height: 20px;
    `;
    
    this.captionEl.addEventListener("focus", () => {
      this.captionEl.style.color = "#333";
    });
    
    this.captionEl.addEventListener("blur", () => {
      if (!this.captionEl.textContent.trim()) {
        this.captionEl.style.color = "#999";
      }
    });
    
    container.appendChild(this.captionEl);
    
    // Change button
    if (!this.readOnly && this.config.onSelectImage) {
      const changeBtn = document.createElement("button");
      changeBtn.textContent = "Change Image";
      changeBtn.style.cssText = `
        margin-top: 8px;
        padding: 6px 12px;
        font-size: 12px;
        background: #f0f0f0;
        border: 1px solid #ddd;
        border-radius: 4px;
        cursor: pointer;
      `;
      changeBtn.addEventListener("click", () => {
        const blockIndex = this.api.blocks.getCurrentBlockIndex();
        this.config.onSelectImage(blockIndex, this);
      });
      container.appendChild(changeBtn);
    }
    
    this.wrapper.appendChild(container);
  }

  // Called externally to update image
  setImage(url, caption = "") {
    this.data.url = url;
    this.data.caption = caption;
    this._renderImage();
  }

  save() {
    return {
      url: this.data.url,
      caption: this.captionEl ? this.captionEl.innerHTML : this.data.caption,
      withBorder: this.data.withBorder,
      withBackground: this.data.withBackground,
      stretched: this.data.stretched,
    };
  }

  // Allow empty blocks - validation happens at save time in BlockEditor
  validate(savedData) {
    return true;
  }

  renderSettings() {
    const wrapper = document.createElement("div");
    
    const settings = [
      { name: "withBorder", icon: "□", title: "Border" },
      { name: "stretched", icon: "↔", title: "Stretch" },
      { name: "withBackground", icon: "▢", title: "Background" },
    ];
    
    settings.forEach(setting => {
      const btn = document.createElement("div");
      btn.classList.add("cdx-settings-button");
      btn.innerHTML = setting.icon;
      btn.title = setting.title;
      btn.style.cssText = `
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        cursor: pointer;
        ${this.data[setting.name] ? "background: #eff2f5;" : ""}
      `;
      
      btn.addEventListener("click", () => {
        this.data[setting.name] = !this.data[setting.name];
        btn.style.background = this.data[setting.name] ? "#eff2f5" : "";
        if (this.imageEl) {
          this.imageEl.style.border = this.data.withBorder ? "1px solid #ccc" : "none";
          this.imageEl.style.width = this.data.stretched ? "100%" : "auto";
          this.imageEl.style.background = this.data.withBackground ? "#f0f0f0" : "none";
          this.imageEl.style.padding = this.data.withBackground ? "10px" : "0";
        }
      });
      
      wrapper.appendChild(btn);
    });
    
    return wrapper;
  }
}
