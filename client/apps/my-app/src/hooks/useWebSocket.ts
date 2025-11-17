import { useEffect, useRef, useState, useCallback } from 'react';
import { Client, IMessage } from '@stomp/stompjs';
// @ts-ignore - SockJS doesn't have type definitions
import SockJS from 'sockjs-client';
import { Order } from '../api/orderApi';
import { Customer } from '../api/customerApi';
import { Product } from '../api/productApi';
import { Address } from '../api/addressApi';
import type { User } from '../api/userApi';
import { Vendor } from '../api/vendorApi';
import { RMA } from '../api/rmaApi';

export type EntityType = 'order' | 'customer' | 'product' | 'address' | 'user' | 'rma';

export interface EntityUpdateMessage {
  type: EntityType;
  action: 'update' | 'delete';
  data: any;
}

interface UseWebSocketOptions {
  onOrderUpdate?: (order: Order) => void;
  onOrderDelete?: (orderId: string) => void;
  onCustomerUpdate?: (customer: Customer) => void;
  onCustomerDelete?: (customerId: string) => void;
  onProductUpdate?: (product: Product) => void;
  onProductDelete?: (productId: string) => void;
  onAddressUpdate?: (address: Address) => void;
  onAddressDelete?: (addressId: string) => void;
  onUserUpdate?: (user: User) => void;
  onUserDelete?: (userId: string) => void;
  onVendorUpdate?: (vendor: Vendor) => void;
  onVendorDelete?: (vendorId: string) => void;
  onRMAUpdate?: (rma: RMA) => void;
  onRMADelete?: (rmaId: string) => void;
  enabled?: boolean;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    onOrderUpdate,
    onOrderDelete,
    onCustomerUpdate,
    onCustomerDelete,
    onProductUpdate,
    onProductDelete,
    onAddressUpdate,
    onAddressDelete,
    onUserUpdate,
    onUserDelete,
    onVendorUpdate,
    onVendorDelete,
    onRMAUpdate,
    onRMADelete,
    enabled = true,
  } = options;
  const [connected, setConnected] = useState(false);
  const clientRef = useRef<Client | null>(null);

  // Register WebSocket clients globally for cleanup on app close
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!window.__webSocketClients) {
        window.__webSocketClients = [];
      }
    }
  }, []);

  const connect = useCallback(() => {
    if (!enabled) return;

    const client = new Client({
      // @ts-ignore - SockJS doesn't have type definitions
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('WebSocket connected');
        setConnected(true);

        // Subscribe to order updates
        if (onOrderUpdate || onOrderDelete) {
          client.subscribe('/topic/orders/update', (message: IMessage) => {
            try {
              const order: Order = JSON.parse(message.body);
              console.log('Received order update:', order);
              onOrderUpdate?.(order);
            } catch (error) {
              console.error('Error parsing order update:', error);
            }
          });

          client.subscribe('/topic/orders/delete', (message: IMessage) => {
            try {
              const orderId: string = message.body;
              console.log('Received order deletion:', orderId);
              onOrderDelete?.(orderId);
            } catch (error) {
              console.error('Error parsing order deletion:', error);
            }
          });
        }

        // Subscribe to customer updates
        if (onCustomerUpdate || onCustomerDelete) {
          client.subscribe('/topic/customers/update', (message: IMessage) => {
            try {
              const customer: Customer = JSON.parse(message.body);
              console.log('Received customer update:', customer);
              onCustomerUpdate?.(customer);
            } catch (error) {
              console.error('Error parsing customer update:', error);
            }
          });

          client.subscribe('/topic/customers/delete', (message: IMessage) => {
            try {
              const customerId: string = message.body;
              console.log('Received customer deletion:', customerId);
              onCustomerDelete?.(customerId);
            } catch (error) {
              console.error('Error parsing customer deletion:', error);
            }
          });
        }

        // Subscribe to product updates
        if (onProductUpdate || onProductDelete) {
          client.subscribe('/topic/products/update', (message: IMessage) => {
            try {
              const product: Product = JSON.parse(message.body);
              console.log('Received product update:', product);
              onProductUpdate?.(product);
            } catch (error) {
              console.error('Error parsing product update:', error);
            }
          });

          client.subscribe('/topic/products/delete', (message: IMessage) => {
            try {
              const productId: string = message.body;
              console.log('Received product deletion:', productId);
              onProductDelete?.(productId);
            } catch (error) {
              console.error('Error parsing product deletion:', error);
            }
          });
        }

        // Subscribe to address updates
        if (onAddressUpdate || onAddressDelete) {
          client.subscribe('/topic/addresses/update', (message: IMessage) => {
            try {
              const address: Address = JSON.parse(message.body);
              console.log('Received address update:', address);
              onAddressUpdate?.(address);
            } catch (error) {
              console.error('Error parsing address update:', error);
            }
          });

          client.subscribe('/topic/addresses/delete', (message: IMessage) => {
            try {
              const addressId: string = message.body;
              console.log('Received address deletion:', addressId);
              onAddressDelete?.(addressId);
            } catch (error) {
              console.error('Error parsing address deletion:', error);
            }
          });
        }

        // Subscribe to user updates
        if (onUserUpdate || onUserDelete) {
          client.subscribe('/topic/users/update', (message: IMessage) => {
            try {
              const user: User = JSON.parse(message.body);
              console.log('Received user update:', user);
              onUserUpdate?.(user);
            } catch (error) {
              console.error('Error parsing user update:', error);
            }
          });

          client.subscribe('/topic/users/delete', (message: IMessage) => {
            try {
              const userId: string = message.body;
              console.log('Received user deletion:', userId);
              onUserDelete?.(userId);
            } catch (error) {
              console.error('Error parsing user deletion:', error);
            }
          });
        }

        // Subscribe to vendor updates
        if (onVendorUpdate || onVendorDelete) {
          client.subscribe('/topic/vendors/update', (message: IMessage) => {
            try {
              const vendor: Vendor = JSON.parse(message.body);
              console.log('Received vendor update:', vendor);
              onVendorUpdate?.(vendor);
            } catch (error) {
              console.error('Error parsing vendor update:', error);
            }
          });

          client.subscribe('/topic/vendors/delete', (message: IMessage) => {
            try {
              const vendorId: string = message.body;
              console.log('Received vendor deletion:', vendorId);
              onVendorDelete?.(vendorId);
            } catch (error) {
              console.error('Error parsing vendor deletion:', error);
            }
          });
        }

        // Subscribe to RMA updates
        if (onRMAUpdate || onRMADelete) {
          client.subscribe('/topic/rmas/update', (message: IMessage) => {
            try {
              const rma: RMA = JSON.parse(message.body);
              console.log('Received RMA update:', rma);
              onRMAUpdate?.(rma);
            } catch (error) {
              console.error('Error parsing RMA update:', error);
            }
          });

          client.subscribe('/topic/rmas/delete', (message: IMessage) => {
            try {
              const rmaId: string = message.body;
              console.log('Received RMA deletion:', rmaId);
              onRMADelete?.(rmaId);
            } catch (error) {
              console.error('Error parsing RMA deletion:', error);
            }
          });
        }
      },
      onDisconnect: () => {
        console.log('WebSocket disconnected');
        setConnected(false);
      },
      onStompError: (frame) => {
        console.error('WebSocket STOMP error:', frame);
        setConnected(false);
      },
      onWebSocketError: (event) => {
        console.error('WebSocket error:', event);
        setConnected(false);
      },
    });

    client.activate();
    clientRef.current = client;

    // Register client globally for cleanup
    if (typeof window !== 'undefined') {
      if (!window.__webSocketClients) {
        window.__webSocketClients = [];
      }
      window.__webSocketClients.push(client);
    }
  }, [
    enabled,
    onOrderUpdate,
    onOrderDelete,
    onCustomerUpdate,
    onCustomerDelete,
    onProductUpdate,
    onProductDelete,
    onAddressUpdate,
    onAddressDelete,
    onUserUpdate,
    onUserDelete,
    onVendorUpdate,
    onVendorDelete,
    onRMAUpdate,
    onRMADelete,
  ]);

  const disconnect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.deactivate();
      
      // Remove from global registry
      if (typeof window !== 'undefined' && window.__webSocketClients) {
        const index = window.__webSocketClients.indexOf(clientRef.current);
        if (index > -1) {
          window.__webSocketClients.splice(index, 1);
        }
      }
      
      clientRef.current = null;
      setConnected(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      disconnect();
      return;
    }

    connect();

    return () => {
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return { connected, connect, disconnect };
}

