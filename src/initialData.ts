import { AppState } from "./types";

export const INITIAL_APP_STATE: AppState = {
  factoryInfo: {
    phoneNumber: "+91 98765 43210",
    factoryAddress: "Industrial Glass Zone, Ring Road Area, Firozabad, Uttar Pradesh, India",
    youtubeId: "@FaizanBanglesOfficial",
    youtubeUrl: "https://www.youtube.com/c/FaizanBanglesOfficial",
    ownerName: "Faizan Raza"
  },
  pipeConfig: {
    pipesSizeAvailable: "2.2 inches, 2.4 inches, 2.6 inches, 2.8 inches (Standard Exports)",
    perLotPrize: "Rs. 1,250 per lot of gold satin finished bangles"
  },
  pipesList: [
    {
      id: "pipe-1",
      imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600",
      title: "Royal Golden Electroplated Pipe",
      description: "Lustrous high-gloss gold layer designed to resist chips and heat damage.",
      createdAt: "2026-05-20T04:26:00Z"
    },
    {
      id: "pipe-2",
      imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=600",
      title: "Metallic Brass Satin Finish Pipe",
      description: "Sophisticated satin gold texture for premium traditional bangle fabrication.",
      createdAt: "2026-05-20T04:26:01Z"
    },
    {
      id: "pipe-3",
      imageUrl: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&q=80&w=600",
      title: "Thermal Copper-Glaze Hot Pipe",
      description: "Specialized high-durability pipe used in standard 25 and 29 pipe machinery.",
      createdAt: "2026-05-20T04:26:02Z"
    }
  ],
  machines: [
    { id: "m-25", name: "25 PIPES MACHINE", status: "ONLINE" },
    { id: "m-29", name: "29 PIPES MACHINE", status: "ONLINE" }
  ],
  logoUrl: ""
};
