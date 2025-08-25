using BilgeLojistikIK.API.Models;

namespace BilgeLojistikIK.API.Services
{
    public interface IIzinService
    {
        Task<int> CalculateYillikIzinHakki(int personelId);
        Task<int> CalculateKullanilmisIzin(int personelId, int yil);
        Task<int> CalculateKalanIzin(int personelId);
        Task<bool> CheckIzinCakismasi(int personelId, DateTime baslangic, DateTime bitis, int? excludeIzinId = null);
        Task<List<Personel>> GetOnaylamaYetkilisiOlanPersoneller(int talepEdenPersonelId);
        Task<bool> CanPersonelApproveIzin(int onaylayanPersonelId, int talepEdenPersonelId);
        int CalculateGunSayisi(DateTime baslangic, DateTime bitis);
        Task<Dictionary<string, object>> GetPersonelIzinOzeti(int personelId);
    }
}