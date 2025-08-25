using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BilgeLojistikIK.API.Migrations
{
    /// <inheritdoc />
    public partial class FixSequenceIssue : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Sequence'ı tablodaki en büyük id'ye göre resetle
            migrationBuilder.Sql("SELECT setval('izin_talepleri_id_seq', (SELECT COALESCE(MAX(id), 1) FROM izin_talepleri))");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
