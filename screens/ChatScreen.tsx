import React, { useState, useEffect } from 'react';
import { 
  View, Text, TouchableOpacity, TextInput, FlatList, 
  StyleSheet, Alert, StatusBar, KeyboardAvoidingView, Platform, SafeAreaView 
} from 'react-native';
import { usePushToken } from '../context/PushTokenContext';
import { sendPushNotification } from '../services/pushNotifications';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ChatScreen() {
  const { expoPushToken } = usePushToken();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const insets = useSafeAreaInsets();
  
  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    const newMsg = { 
      id: Date.now().toString(), 
      text: inputMessage,
      isMine: true,
      timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };
    setMessages((prev) => [newMsg, ...prev]);
    setInputMessage('');
  };

  const handleSendNotification = async () => {
    if (!expoPushToken) {
      Alert.alert('Error', 'No hay token disponible');
      return;
    }
    try {
      await sendPushNotification(expoPushToken, 'Nuevo Mensaje en ZDAD', '¡Tienes un nuevo mensaje!');
      
      // Simulamos recibir un mensaje después de enviar notificación
      setTimeout(() => {
        const responseMsg = { 
          id: Date.now().toString(), 
          text: "¡Hola! Recibí tu notificación",
          isMine: false,
          timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        };
        setMessages((prev) => [responseMsg, ...prev]);
      }, 1500);
      
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
      >
        <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? 0 : insets.top }]}>
          <Text style={styles.headerTitle}>ZDAD</Text>
        </View>
        
        <FlatList
          inverted
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.messageList,
            { paddingBottom: 10 }
          ]}
          renderItem={({ item }) => (
            <View style={[
              styles.bubble, 
              item.isMine ? styles.myBubble : styles.theirBubble
            ]}>
              <Text style={[
                styles.bubbleText,
                item.isMine ? styles.myBubbleText : styles.theirBubbleText
              ]}>{item.text}</Text>
              <Text style={[
                styles.timestamp,
                item.isMine ? styles.myTimestamp : styles.theirTimestamp
              ]}>{item.timestamp}</Text>
            </View>
          )}
        />
        
        <View style={styles.notificationSection}>
          <TouchableOpacity 
            style={styles.notifyButton} 
            onPress={handleSendNotification}
          >
            <Ionicons name="notifications" size={16} color="#fff" />
            <Text style={styles.notifyButtonText}>Enviar notificación</Text>
          </TouchableOpacity>
        </View>
        
        <View style={[
          styles.inputContainer,
          { paddingBottom: Math.max(insets.bottom, 10) }
        ]}>
          <TextInput
            style={styles.input}
            placeholder="Escribe un mensaje..."
            value={inputMessage}
            onChangeText={setInputMessage}
            placeholderTextColor="#999"
          />
          <TouchableOpacity 
            style={styles.sendButton} 
            onPress={handleSendMessage}
            disabled={!inputMessage.trim()}
          >
            <Ionicons name="send" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#2C3E50', // Mismo color que el header para que se vea uniforme
  },
  container: { 
    flex: 1, 
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2C3E50',
    paddingVertical: 15,
    paddingHorizontal: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  messageList: {
    padding: 15,
  },
  notificationSection: {
    alignItems: 'center',
    padding: 10,
  },
  notifyButton: {
    flexDirection: 'row',
    backgroundColor: '#2C3E50',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  notifyButtonText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#2C3E50',
    width: 45,
    height: 45,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bubble: {
    padding: 12,
    marginVertical: 5,
    borderRadius: 20,
    maxWidth: '80%',
  },
  myBubble: {
    backgroundColor: '#2C3E50',
    alignSelf: 'flex-end',
    borderTopRightRadius: 5,
  },
  theirBubble: {
    backgroundColor: 'white',
    alignSelf: 'flex-start',
    borderTopLeftRadius: 5,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  bubbleText: {
    fontSize: 16,
  },
  myBubbleText: {
    color: 'white',
  },
  theirBubbleText: {
    color: '#333',
  },
  timestamp: {
    fontSize: 11,
    alignSelf: 'flex-end',
    marginTop: 5,
  },
  myTimestamp: {
    color: 'rgba(255,255,255,0.7)',
  },
  theirTimestamp: {
    color: '#aaa',
  }
});