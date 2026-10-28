import { SharedWishlist, SharedWishlistItem, WishlistOccasion, User, Product } from '../types';
import { storage } from './storage';

export interface CreateSharedWishlistParams {
  owner: User;
  productIds: string[];
  title?: string;
  occasion?: WishlistOccasion;
  customMessage?: string;
  isPublic?: boolean;
}

export const sharedWishlistService = {
  /**
   * Generates a clean, friendly share code like "WL-CARLOS-784"
   */
  generateCode(ownerName: string): string {
    const cleanName = (ownerName || 'USER')
      .split(' ')[0]
      .toUpperCase()
      .replace(/[^A-Z]/g, '')
      .substring(0, 8);
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `WL-${cleanName || 'GIFT'}-${randomHex}`;
  },

  /**
   * Encodes a minimal payload for URL-safe transport across separate browsers/devices.
   */
  encodePayload(wishlist: SharedWishlist): string {
    try {
      const minimal = {
        i: wishlist.id,
        t: wishlist.title,
        o: wishlist.ownerName,
        c: wishlist.ownerCity || 'Bolivia',
        k: wishlist.occasion,
        m: wishlist.customMessage || '',
        p: wishlist.productIds,
      };
      const json = JSON.stringify(minimal);
      // Safe base64 for UTF-8
      const encoded = btoa(encodeURIComponent(json));
      return encoded;
    } catch {
      return '';
    }
  },

  /**
   * Decodes a minimal payload from URL.
   */
  decodePayload(payload: string): SharedWishlist | null {
    try {
      const decoded = decodeURIComponent(atob(payload));
      const obj = JSON.parse(decoded);
      if (!obj || !obj.i || !Array.isArray(obj.p)) return null;

      const wishlist: SharedWishlist = {
        id: obj.i,
        title: obj.t || 'Lista de Deseos & Regalos',
        ownerId: 'remote-user',
        ownerName: obj.o || 'Amigo / Familiar',
        ownerCity: obj.c || 'Bolivia',
        occasion: obj.k || 'Otro',
        customMessage: obj.m || '',
        productIds: obj.p,
        items: obj.p.map((pid: string) => ({ productId: pid })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isPublic: true,
        viewsCount: 1,
      };
      return wishlist;
    } catch {
      return null;
    }
  },

  /**
   * Finds or creates a shared wishlist for the user's current wishlist items.
   */
  getOrCreateForUser(params: CreateSharedWishlistParams): SharedWishlist {
    const { owner, productIds, title, occasion = 'Cumpleaños', customMessage, isPublic = true } = params;
    const existingList = storage.getSharedWishlists();

    // Check if user already has an active shared wishlist
    const userExisting = existingList.find((w) => w.ownerId === owner.id);

    if (userExisting) {
      // Update with current productIds and any new options
      const updated: SharedWishlist = {
        ...userExisting,
        title: title || userExisting.title || `Lista de Regalos de ${owner.name}`,
        occasion: occasion || userExisting.occasion,
        customMessage: customMessage !== undefined ? customMessage : userExisting.customMessage,
        productIds,
        // Preserve existing reservations if product still in list
        items: productIds.map((pid) => {
          const old = userExisting.items?.find((i) => i.productId === pid);
          return old || { productId: pid };
        }),
        isPublic,
        updatedAt: new Date().toISOString(),
      };
      storage.saveSharedWishlist(updated);
      return updated;
    }

    // Create a new one
    const newId = this.generateCode(owner.name);
    const newWishlist: SharedWishlist = {
      id: newId,
      title: title || `Lista de Regalos & Deseos de ${owner.name}`,
      ownerId: owner.id,
      ownerName: `${owner.name} ${owner.lastName || ''}`.trim(),
      ownerCity: owner.city || owner.department || 'La Paz',
      occasion,
      customMessage:
        customMessage ||
        `¡Hola familia y amigos! Aquí les comparto los productos que me encantarían como regalo para ${occasion.toLowerCase()}. ¡Muchas gracias por el detalle!`,
      productIds,
      items: productIds.map((pid) => ({ productId: pid })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPublic,
      viewsCount: 0,
    };

    storage.saveSharedWishlist(newWishlist);
    return newWishlist;
  },

  /**
   * Looks up a wishlist by code or decoded URL payload.
   */
  resolveWishlist(codeOrParam: string): SharedWishlist | null {
    if (!codeOrParam) return null;

    // Check if it's a direct code match in storage
    const stored = storage.getSharedWishlist(codeOrParam);
    if (stored) {
      return stored;
    }

    // Check if it's base64 encoded payload
    if (codeOrParam.length > 20 && !codeOrParam.startsWith('WL-')) {
      const decoded = this.decodePayload(codeOrParam);
      if (decoded) {
        // Cache to storage so subsequent reservations persist
        storage.saveSharedWishlist(decoded);
        return decoded;
      }
    }

    // Try finding by prefix / case-insensitive
    const all = storage.getSharedWishlists();
    const clean = codeOrParam.trim().toUpperCase();
    const found = all.find((w) => w.id.toUpperCase() === clean);
    if (found) return found;

    return null;
  },

  /**
   * Generates public share URL.
   */
  generateShareUrl(wishlist: SharedWishlist): string {
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    const payload = this.encodePayload(wishlist);

    // Primary clean URL with code + portable payload fallback
    return `${origin}${pathname}?wishlist=${wishlist.id}&wl_data=${payload}`;
  },

  /**
   * Generates clean short link for easy copy-pasting.
   */
  generateShortShareUrl(wishlist: SharedWishlist): string {
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    return `${origin}${pathname}?wishlist=${wishlist.id}`;
  },

  /**
   * Generates pre-filled WhatsApp share link.
   */
  generateWhatsAppShareUrl(wishlist: SharedWishlist, products: Product[]): string {
    const shareUrl = this.generateShortShareUrl(wishlist);
    const occasionEmoji =
      wishlist.occasion === 'Cumpleaños'
        ? '🎂🎉'
        : wishlist.occasion === 'Boda / Matrimonio'
        ? '💍👰'
        : wishlist.occasion === 'Navidad / Fiestas'
        ? '🎄✨'
        : wishlist.occasion === 'Graduación'
        ? '🎓🍾'
        : '🎁✨';

    const itemsPreview = products
      .slice(0, 4)
      .map((p, idx) => `${idx + 1}. ${p.nombre} (Bs. ${p.precio})`)
      .join('\n');

    const moreText = products.length > 4 ? `\n...y ${products.length - 4} más.` : '';

    const text =
      `¡Hola! Te comparto mi *Lista de Deseos & Regalos* en X-CRISPIN Bolivia ${occasionEmoji}\n\n` +
      `📌 *${wishlist.title}*\n` +
      `👤 Creada por: ${wishlist.ownerName}\n` +
      (wishlist.customMessage ? `💬 "${wishlist.customMessage}"\n\n` : '\n') +
      `🎁 *Artículos deseados:*\n${itemsPreview}${moreText}\n\n` +
      `👉 Puedes ver mi lista completa, reservar un regalo o comprarlo con entrega en Bolivia aquí:\n${shareUrl}`;

    return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  },

  /**
   * Generates pre-filled Telegram share link.
   */
  generateTelegramShareUrl(wishlist: SharedWishlist): string {
    const shareUrl = this.generateShortShareUrl(wishlist);
    const text = `🎁 ${wishlist.title} de ${wishlist.ownerName} en X-CRISPIN Bolivia:`;
    return `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`;
  },

  /**
   * Reserves an item on the wishlist on behalf of a friend/family member.
   */
  reserveItem(wishlistId: string, productId: string, reserverName: string): boolean {
    return storage.reserveWishlistItem(wishlistId, productId, reserverName);
  },

  /**
   * Un-reserves an item.
   */
  unreserveItem(wishlistId: string, productId: string): boolean {
    return storage.unreserveWishlistItem(wishlistId, productId);
  },
};
