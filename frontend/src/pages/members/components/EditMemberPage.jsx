import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2 } from 'lucide-react';
import SelectWithOther from './SelectWithOther';
import DateInput from './DateInput';
import AchievementManager from './AchievementManager';
import {
  ADDRESS_OPTIONS,
  OCCUPATION_OPTIONS,
  CAUSE_OF_DEATH_OPTIONS,
  BURIAL_LOCATION_OPTIONS,
  PROVINCE_OPTIONS,
  formatDateForInput,
} from './fieldOptions';
import { getMemberById, updateMember, transformMemberData } from '../../../services/memberService';
import { getCurrentFamilyId } from '../../../services/familyService';

const EditMemberPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [memberData, setMemberData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMemberData = async () => {
      try {
        const data = await getMemberById(id);
        setMemberData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMemberData();
  }, [id]);

  const handleUpdateMember = async (updatedData) => {
    setLoading(true);
    try {
      await updateMember(id, updatedData);
      navigate(`/members/${id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center mb-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 mr-4 text-white bg-blue-500 rounded"
        >
          <ArrowLeft />
        </button>
        <h1 className="text-2xl font-semibold">Edit Member</h1>
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="bg-white rounded-lg shadow-md p-6"
      >
        <SelectWithOther
          label="Address"
          options={ADDRESS_OPTIONS}
          value={memberData.address}
          onChange={(value) => setMemberData({ ...memberData, address: value })}
        />
        <DateInput
          label="Date of Birth"
          value={formatDateForInput(memberData.dateOfBirth)}
          onChange={(value) => setMemberData({ ...memberData, dateOfBirth: value })}
        />
        <AchievementManager
          achievements={memberData.achievements}
          onUpdate={(achievements) => setMemberData({ ...memberData, achievements })}
        />
        <button
          onClick={() => handleUpdateMember(memberData)}
          className="mt-4 w-full p-2 text-white bg-green-500 rounded"
        >
          Save Changes
        </button>
      </motion.div>
    </div>
  );
};

export default EditMemberPage;
