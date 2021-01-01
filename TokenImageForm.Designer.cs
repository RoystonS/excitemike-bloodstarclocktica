
namespace BloodstarClocktica
{
    partial class TokenImageForm
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            System.Windows.Forms.GroupBox groupBox1;
            System.Windows.Forms.Button OkButton;
            System.Windows.Forms.Button CancelButton;
            this.tableLayoutPanel1 = new System.Windows.Forms.TableLayoutPanel();
            this.groupBox2 = new System.Windows.Forms.GroupBox();
            this.SourceImageButton = new System.Windows.Forms.Button();
            groupBox1 = new System.Windows.Forms.GroupBox();
            OkButton = new System.Windows.Forms.Button();
            CancelButton = new System.Windows.Forms.Button();
            this.tableLayoutPanel1.SuspendLayout();
            groupBox1.SuspendLayout();
            this.SuspendLayout();
            // 
            // tableLayoutPanel1
            // 
            this.tableLayoutPanel1.ColumnCount = 2;
            this.tableLayoutPanel1.ColumnStyles.Add(new System.Windows.Forms.ColumnStyle(System.Windows.Forms.SizeType.Percent, 50F));
            this.tableLayoutPanel1.ColumnStyles.Add(new System.Windows.Forms.ColumnStyle(System.Windows.Forms.SizeType.Percent, 50F));
            this.tableLayoutPanel1.Controls.Add(groupBox1, 0, 0);
            this.tableLayoutPanel1.Controls.Add(this.groupBox2, 1, 0);
            this.tableLayoutPanel1.Controls.Add(OkButton, 0, 1);
            this.tableLayoutPanel1.Controls.Add(CancelButton, 1, 1);
            this.tableLayoutPanel1.Dock = System.Windows.Forms.DockStyle.Fill;
            this.tableLayoutPanel1.Location = new System.Drawing.Point(0, 0);
            this.tableLayoutPanel1.Name = "tableLayoutPanel1";
            this.tableLayoutPanel1.RowCount = 2;
            this.tableLayoutPanel1.RowStyles.Add(new System.Windows.Forms.RowStyle(System.Windows.Forms.SizeType.Percent, 100F));
            this.tableLayoutPanel1.RowStyles.Add(new System.Windows.Forms.RowStyle(System.Windows.Forms.SizeType.Absolute, 50F));
            this.tableLayoutPanel1.Size = new System.Drawing.Size(800, 450);
            this.tableLayoutPanel1.TabIndex = 0;
            // 
            // groupBox1
            // 
            groupBox1.Controls.Add(this.SourceImageButton);
            groupBox1.Dock = System.Windows.Forms.DockStyle.Fill;
            groupBox1.Location = new System.Drawing.Point(3, 3);
            groupBox1.Name = "groupBox1";
            groupBox1.Size = new System.Drawing.Size(394, 394);
            groupBox1.TabIndex = 0;
            groupBox1.TabStop = false;
            groupBox1.Text = "Source Image";
            // 
            // groupBox2
            // 
            this.groupBox2.Dock = System.Windows.Forms.DockStyle.Fill;
            this.groupBox2.Location = new System.Drawing.Point(403, 3);
            this.groupBox2.Name = "groupBox2";
            this.groupBox2.Size = new System.Drawing.Size(394, 394);
            this.groupBox2.TabIndex = 1;
            this.groupBox2.TabStop = false;
            this.groupBox2.Text = "Processed Image";
            // 
            // SourceImageButton
            // 
            this.SourceImageButton.Dock = System.Windows.Forms.DockStyle.Fill;
            this.SourceImageButton.Location = new System.Drawing.Point(3, 16);
            this.SourceImageButton.Name = "SourceImageButton";
            this.SourceImageButton.Size = new System.Drawing.Size(388, 375);
            this.SourceImageButton.TabIndex = 0;
            this.SourceImageButton.Text = "Click to import source image";
            this.SourceImageButton.UseVisualStyleBackColor = true;
            // 
            // OkButton
            // 
            OkButton.Dock = System.Windows.Forms.DockStyle.Fill;
            OkButton.Location = new System.Drawing.Point(3, 403);
            OkButton.Name = "OkButton";
            OkButton.Size = new System.Drawing.Size(394, 44);
            OkButton.TabIndex = 1;
            OkButton.Text = "&Ok";
            OkButton.UseVisualStyleBackColor = true;
            // 
            // CancelButton
            // 
            CancelButton.DialogResult = System.Windows.Forms.DialogResult.Cancel;
            CancelButton.Dock = System.Windows.Forms.DockStyle.Fill;
            CancelButton.Location = new System.Drawing.Point(403, 403);
            CancelButton.Name = "CancelButton";
            CancelButton.Size = new System.Drawing.Size(394, 44);
            CancelButton.TabIndex = 2;
            CancelButton.Text = "&Cancel";
            CancelButton.UseVisualStyleBackColor = true;
            // 
            // TokenImageForm
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(800, 450);
            this.Controls.Add(this.tableLayoutPanel1);
            this.Name = "TokenImageForm";
            this.ShowIcon = false;
            this.Text = "TokenImageForm";
            this.TopMost = true;
            this.tableLayoutPanel1.ResumeLayout(false);
            groupBox1.ResumeLayout(false);
            this.ResumeLayout(false);

        }

        #endregion

        private System.Windows.Forms.TableLayoutPanel tableLayoutPanel1;
        private System.Windows.Forms.GroupBox groupBox2;
        private System.Windows.Forms.Button SourceImageButton;
    }
}