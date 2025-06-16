import React, { useEffect } from 'react';
import { StyleSheet, ActivityIndicator, View, RefreshControl, FlatList, Button, ScrollView, TouchableOpacity } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useDispensers } from '@/hooks/useDispensers';
import AddDispenserModal from '@/components/home/AddDispenserModal';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import DispenserDetailModal from '@/components/home/DispenserDetailModal';
import { FloatingActionButton } from '@/components/home/FloatingActionButton';
import { DispenserCard } from '@/components/DispenserCard';
import { Container } from '@/types/dispenser';
import { useAuthFlow } from '@/hooks/useAuthFlow';

export default function HomeScreen() {
  const { userData } = useAuthFlow();
  const router = useRouter();

  const {
    containers,
    loading: isLoading,
    error,
    retryFetch,
    isRefreshing,
    onRefresh,
    addContainer,
    deleteContainer,
  } = useDispensers();

  const [addModalVisible, setAddModalVisible] = React.useState(false);
  
  const [selectedContainer, setSelectedContainer] = React.useState<Container | null>(null);

  useEffect(() => {
    // This effect ensures that if the detailed view is open and the dispenser list
    // is refreshed, the detailed view gets the updated data automatically.
    if (selectedContainer) {
      const newContainerData = containers.find(c => c.id === selectedContainer.id);
      if (newContainerData) {
        setSelectedContainer(newContainerData);
      } else {
        // The container was likely deleted, so close the modal.
        setSelectedContainer(null);
      }
    }
  }, [containers]);

  const handleOpenDetails = (container: Container) => {
    setSelectedContainer(container);
  };

  const handleOpenAdd = () => {
    setAddModalVisible(true);
  };

  const handleCloseDetails = () => {
    setSelectedContainer(null);
  };
  
  const handleDataRefresh = () => {
    onRefresh();
  };

  const renderContent = () => {
    if (isLoading && !isRefreshing) {
      return <ActivityIndicator size="large" color="#fff" style={styles.centered} />;
    }

    if (error) {
      return (
        <View style={styles.centered}>
          <ThemedText style={{marginBottom: 10}}>Error: {error.message}</ThemedText>
          <Button title="Retry" onPress={retryFetch} color="#007AFF" />
        </View>
      );
    }

    if (!containers || containers.length === 0) {
      return (
        <ScrollView 
          contentContainerStyle={styles.centered}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#fff" />
          }
        >
          <ThemedText>No dispensers found.</ThemedText>
          <ThemedText>Click the '+' button to add one.</ThemedText>
        </ScrollView>
      );
    }

    return (
      <FlatList
        data={containers}
        renderItem={({ item }) => (
          <DispenserCard 
            dispenser={item} 
            onPress={() => handleOpenDetails(item)} 
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#fff" />
        }
      />
    );
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.headerContainer}>
        <View>
          <ThemedText style={styles.headerGreeting}>Welcome back,</ThemedText>
          <ThemedText type="title" style={styles.headerUsername}>
            {userData ? userData.username : '...'}
          </ThemedText>
        </View>
        <TouchableOpacity onPress={() => router.push('/MyPage')} style={styles.profileIcon}>
          <FontAwesome name="user-circle" size={32} color="#fff" />
        </TouchableOpacity>
      </View>

      {renderContent()}

      <AddDispenserModal
        isVisible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onAddContainer={addContainer}
      />

      {selectedContainer && (
        <DispenserDetailModal
          container={selectedContainer}
          isVisible={!!selectedContainer}
          onClose={handleCloseDetails}
          onDataNeedsRefresh={handleDataRefresh}
          onDeleteContainer={deleteContainer}
        />
      )}

      <FloatingActionButton onPress={handleOpenAdd} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#151718',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16, // Reduced padding to remove extra space
    paddingBottom: 16,
    backgroundColor: '#1C1C1E',
  },
  headerGreeting: {
    fontSize: 16,
    color: '#9BA1A6',
  },
  headerUsername: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  profileIcon: {
    padding: 8,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingVertical: 10,
    paddingBottom: 80, // Ensure space for FAB
  },
});


