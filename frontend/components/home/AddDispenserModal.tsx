import React, { useState } from 'react';
import { Modal, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

interface AddDispenserModalProps {
  visible: boolean;
  onClose: () => void;
  onAddContainer: (name: string, serialId: string) => Promise<void>;
}

export default function AddDispenserModal({ visible, onClose, onAddContainer }: AddDispenserModalProps) {
  const [name, setName] = useState('');
  const [serialId, setSerialId] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);

  const handleAdd = async () => {
    setModalError(null);
    if (!name || !serialId) {
      setModalError("Please provide a name and a serial ID.");
      return;
    }
    try {
      await onAddContainer(name, serialId);
      setName('');
      setSerialId('');
      onClose();
    } catch (err: any) {
      setModalError(err.message);
    }
  };

  const handleClose = () => {
    setModalError(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#9669C7', dark: '#645273' }}
        headerImage={
          <Image
            source={require('@/assets/images/kitty-removebg-preview1.png')}
            style={styles.kittyImage}
          />
        }
      >
        <ThemedView style={styles.formContainer}>
          <ThemedText type="title">Add New Dispenser</ThemedText>
          <ThemedText style={{ marginBottom: 24, color: '#555', textAlign: 'center' }}>
            Enter a unique name and the serial ID for your new dispenser.
          </ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Dispenser Name"
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (modalError) setModalError(null);
            }}
            placeholderTextColor="#999"
          />
          <TextInput
            style={styles.input}
            placeholder="Serial ID"
            value={serialId}
            onChangeText={(text) => {
              setSerialId(text);
              if (modalError) setModalError(null);
            }}
            placeholderTextColor="#999"
          />
          <TouchableOpacity style={styles.modalButton} onPress={handleAdd}>
            <ThemedText style={styles.modalButtonText}>Add Dispenser</ThemedText>
          </TouchableOpacity>
          {modalError && <ThemedText type="error" style={{ marginTop: 16, textAlign: 'center' }}>{modalError}</ThemedText>}
          <TouchableOpacity
            onPress={handleClose}
            style={styles.closeButton}
          >
            <ThemedText style={{ color: '#645273' }}>Cancel</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ParallaxScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  kittyImage: {
    width: 450,
    position: 'static',
    bottom: 0,
    left: 0,
  },
  formContainer: {
    alignItems: 'center',
  },
  input: {
    height: 50,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#555',
    backgroundColor: '#333',
    color: 'white',
    padding: 15,
    width: '100%',
    borderRadius: 10,
  },
  modalButton: {
    backgroundColor: '#645273',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  closeButton: {
    marginTop: 20,
  },
}); 