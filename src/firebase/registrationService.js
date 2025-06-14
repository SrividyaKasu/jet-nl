import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  serverTimestamp,
  getDocs as getDocsOnce,
  limit
} from 'firebase/firestore';
import { getDb } from './config';

const COLLECTION_NAME = 'registrations';

// Test Firebase connection
export const testFirebaseConnection = async () => {
  try {
    const db = await getDb();
    const registrationsRef = collection(db, COLLECTION_NAME);
    await getDocsOnce(query(registrationsRef, limit(1)));
    return true;
  } catch (error) {
    if (error.code === 'permission-denied') {
      throw new Error('Access to the database is denied. Please check Firebase rules.');
    }
    if (error.code === 'unavailable') {
      throw new Error('Database service is currently unavailable. Please try again later.');
    }
    throw new Error('Failed to connect to Firebase: ' + error.message);
  }
};

// Create new registration
export const createRegistration = async (registrationData) => {
  try {
    const db = await getDb();
    const requiredFields = ['name', 'email', 'phone', 'city', 'eventLocation', 'programType', 'numAdults'];
    const missingFields = requiredFields.filter(field => !registrationData[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Generate confirmation number first using a random number
    const randomNum = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    const confirmationNumber = generateConfirmationNumber(randomNum, registrationData.eventLocation);

    const registrationWithMetadata = {
      ...registrationData,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      confirmationNumber // Add confirmation number to the document
    };

    // Save registration to Firestore
    const registrationsRef = collection(db, COLLECTION_NAME);
    const docRef = await addDoc(registrationsRef, registrationWithMetadata);

    return {
      id: docRef.id,
      confirmationNumber,
      ...registrationWithMetadata
    };
  } catch (error) {
    if (error.code === 'permission-denied') {
      throw new Error('Access to the database is denied. Please check Firebase rules.');
    }
    if (error.code === 'unavailable') {
      throw new Error('Database service is currently unavailable. Please try again later.');
    }
    throw new Error(error.message || 'Failed to create registration. Please try again.');
  }
};

// Get registrations by location
export const getRegistrationsByLocation = async (location) => {
  try {
    const db = await getDb();
    const q = query(
      collection(db, COLLECTION_NAME),
      where('eventLocation', '==', location),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    throw new Error('Failed to fetch registrations.');
  }
};

// Get registrations by date range
export const getRegistrationsByDateRange = async (startDate, endDate) => {
  try {
    const db = await getDb();
    const q = query(
      collection(db, COLLECTION_NAME),
      where('createdAt', '>=', startDate),
      where('createdAt', '<=', endDate),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    throw new Error('Failed to fetch registrations for the specified date range.');
  }
};

// Helper function to generate confirmation number
const generateConfirmationNumber = (docId, eventLocation) => {
  const locationCode = eventLocation.substring(0, 3).toUpperCase();
  const uniqueId = docId.slice(-6).toUpperCase();
  const timestamp = new Date().getTime().toString().slice(-4);
  return `JET-${locationCode}-${uniqueId}-${timestamp}`;
}; 