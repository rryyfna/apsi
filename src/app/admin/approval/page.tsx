'use client';

import { useEffect, useState } from 'react';
import { getPendingUsers, approveUser, rejectUser } from '@/app/actions/approval';
import { CheckCircle, XCircle, Clock, ShieldAlert } from 'lucide-react';

export default function ApprovalPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    const pending = await getPendingUsers();
    setUsers(pending);
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUsers();
  }, []);

  const handleApprove = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menyetujui akun ini?')) return;
    const res = await approveUser(id);
    if (res.success) {
      fetchUsers();
    } else {
      alert(res.error);
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menolak dan menghapus pendaftaran ini?')) return;
    const res = await rejectUser(id);
    if (res.success) {
      fetchUsers();
    } else {
      alert(res.error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start space-x-4">
        <div className="bg-orange-100 p-3 rounded-lg text-orange-600">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Persetujuan Akun Baru</h1>
          <p className="text-gray-600 mt-1">Kelola permohonan registrasi pengguna secara mandiri. Setujui hanya akun yang valid (NIM/NIDN terverifikasi) untuk mencegah akses tidak sah.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-500">Memuat data...</div>
        ) : users.length === 0 ? (
          <div className="p-10 text-center flex flex-col items-center">
            <CheckCircle className="w-16 h-16 text-green-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-800">Semua Bersih!</h3>
            <p className="text-gray-500 mt-2">Tidak ada permohonan akun baru yang menunggu persetujuan.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-700 border-b border-gray-200">
                  <th className="py-4 px-6 font-semibold">Tipe Akun</th>
                  <th className="py-4 px-6 font-semibold">Nama Lengkap</th>
                  <th className="py-4 px-6 font-semibold">NIM / NIDN</th>
                  <th className="py-4 px-6 font-semibold">Waktu Daftar</th>
                  <th className="py-4 px-6 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        user.role === 'DOSEN' ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-medium text-gray-800">{user.name}</td>
                    <td className="py-4 px-6 font-mono text-sm text-gray-600">{user.username}</td>
                    <td className="py-4 px-6 text-sm text-gray-500 flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      {new Date(user.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleReject(user.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Tolak & Hapus"
                        >
                          <XCircle className="w-6 h-6" />
                        </button>
                        <button
                          onClick={() => handleApprove(user.id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Setujui"
                        >
                          <CheckCircle className="w-6 h-6" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
