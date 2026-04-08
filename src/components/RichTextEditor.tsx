import api from "../services/api";
import React, { useEffect, useRef, useState } from "react";
import { Platform, Pressable, ScrollView, Text, View } from "react-native";
import { Input } from "../ui/atoms";
import { colors } from "../ui/theme";

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

type ToolbarAction = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

type UploadResponse = {
  path: string;
  url: string;
};

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Description",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editorMessage, setEditorMessage] = useState("");

  useEffect(() => {
    if (Platform.OS !== "web" || isHtmlMode || !editorRef.current) return;
    if (editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [isHtmlMode, value]);

  if (Platform.OS !== "web") {
    return (
      <Input
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        multiline
        style={{ minHeight: 150, textAlignVertical: "top" as never }}
      />
    );
  }

  const focusEditor = () => {
    editorRef.current?.focus();
  };

  const exec = (command: string, commandValue?: string) => {
    focusEditor();
    document.execCommand(command, false, commandValue);
    onChange(editorRef.current?.innerHTML || "");
  };

  const insertLink = () => {
    const url = window.prompt("URL du lien");
    if (!url) return;
    exec("createLink", url);
  };

  const insertImageUrl = () => {
    const url = window.prompt("URL de l'image");
    if (!url) return;
    exec("insertImage", url);
  };

  const triggerLocalImage = () => {
    fileInputRef.current?.click();
  };

  const handleImageFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setEditorMessage("");

    try {
      const formData = new FormData();
      formData.append("image", file, file.name);

      const response = await api.post<UploadResponse>("/products/description-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const uploadedUrl = response.data?.url || response.data?.path;
      if (!uploadedUrl) {
        throw new Error("Le serveur n'a pas retourne l'URL de l'image.");
      }

      exec("insertImage", uploadedUrl);
      setEditorMessage("Image descriptive uploadée avec succès.");
    } catch (error: any) {
      const message = Array.isArray(error?.response?.data?.message)
        ? error.response.data.message.join("\n")
        : error?.response?.data?.message ||
          "Upload impossible. Verifie que le backend est demarre et reessaie.";
      setEditorMessage(message);
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  };

  const actions: ToolbarAction[] = [
    { label: "P", onPress: () => exec("formatBlock", "<p>") },
    { label: "H2", onPress: () => exec("formatBlock", "<h2>") },
    { label: "H3", onPress: () => exec("formatBlock", "<h3>") },
    { label: "B", onPress: () => exec("bold") },
    { label: "I", onPress: () => exec("italic") },
    { label: "U", onPress: () => exec("underline") },
    { label: "List", onPress: () => exec("insertUnorderedList") },
    { label: "1.List", onPress: () => exec("insertOrderedList") },
    { label: "Link", onPress: insertLink },
    { label: "Img URL", onPress: insertImageUrl },
    { label: uploadingImage ? "Upload..." : "Upload Img", onPress: triggerLocalImage, disabled: uploadingImage },
    { label: isHtmlMode ? "Editor" : "HTML", onPress: () => setIsHtmlMode((current) => !current) },
  ];

  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 14,
        overflow: "hidden",
        backgroundColor: colors.white,
      }}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: "#F8FAFC" }}
        contentContainerStyle={{ padding: 8, gap: 8 }}
      >
        {actions.map((action) => (
          <Pressable
            key={action.label}
            onPress={action.disabled ? undefined : action.onPress}
            style={{
              paddingHorizontal: 10,
              paddingVertical: 8,
              borderRadius: 10,
              backgroundColor: action.disabled ? "#E5E7EB" : "white",
              borderWidth: 1,
              borderColor: colors.border,
              opacity: action.disabled ? 0.7 : 1,
            }}
          >
            <Text style={{ color: "#0F172A", fontWeight: "800", fontSize: 12 }}>{action.label}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleImageFile}
      />

      {editorMessage ? (
        <View
          style={{
            paddingHorizontal: 12,
            paddingVertical: 10,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            backgroundColor: uploadingImage ? "#EFF6FF" : "#F0FDF4",
          }}
        >
          <Text style={{ color: uploadingImage ? colors.blue : "#166534", fontWeight: "700" }}>
            {editorMessage}
          </Text>
        </View>
      ) : null}

      {isHtmlMode ? (
        <textarea
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          style={{
            minHeight: 220,
            padding: 14,
            border: 0,
            outline: "none",
            resize: "vertical",
            fontFamily: "monospace",
            fontSize: 14,
          }}
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={(event) => onChange((event.target as HTMLDivElement).innerHTML)}
          onBlur={() => onChange(editorRef.current?.innerHTML || "")}
          style={{
            minHeight: 220,
            padding: 14,
            outline: "none",
            lineHeight: 1.6,
          }}
          className="rich-editor-surface"
          data-placeholder={placeholder}
        />
      )}
    </View>
  );
}
