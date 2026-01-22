// Simulação das integrações para evitar erros no projeto
// Futuramente você pode conectar com APIs reais se precisar

export const Core = {
  InvokeLLM: async () => { console.log("IA desativada"); return ""; },
  SendEmail: async () => { console.log("Email simulado"); return true; },
  UploadFile: async () => { console.log("Upload simulado"); return "https://placehold.co/600x400"; },
  GenerateImage: async () => { return "https://placehold.co/600x400"; },
  ExtractDataFromUploadedFile: async () => { return {}; },
  CreateFileSignedUrl: async () => { return ""; },
  UploadPrivateFile: async () => { return ""; }
};

// Exportações individuais para manter compatibilidade
export const InvokeLLM = Core.InvokeLLM;
export const SendEmail = Core.SendEmail;
export const UploadFile = Core.UploadFile;
export const GenerateImage = Core.GenerateImage;
export const ExtractDataFromUploadedFile = Core.ExtractDataFromUploadedFile;
export const CreateFileSignedUrl = Core.CreateFileSignedUrl;
export const UploadPrivateFile = Core.UploadPrivateFile;