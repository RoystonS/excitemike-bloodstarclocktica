
namespace BloodstarClocktica
{
    partial class NightOrderForm
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
            System.Windows.Forms.Button OkButton;
            this.splitContainer1 = new System.Windows.Forms.SplitContainer();
            this.CharactersList = new System.Windows.Forms.CheckedListBox();
            this.flowLayoutPanel1 = new System.Windows.Forms.FlowLayoutPanel();
            this.MoveCharacterUpButton = new System.Windows.Forms.Button();
            this.MoveCharacterDownButton = new System.Windows.Forms.Button();
            this.TextBox = new System.Windows.Forms.TextBox();
            OkButton = new System.Windows.Forms.Button();
            ((System.ComponentModel.ISupportInitialize)(this.splitContainer1)).BeginInit();
            this.splitContainer1.Panel1.SuspendLayout();
            this.splitContainer1.Panel2.SuspendLayout();
            this.splitContainer1.SuspendLayout();
            this.flowLayoutPanel1.SuspendLayout();
            this.SuspendLayout();
            // 
            // OkButton
            // 
            OkButton.Anchor = ((System.Windows.Forms.AnchorStyles)(((System.Windows.Forms.AnchorStyles.Bottom | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            OkButton.DialogResult = System.Windows.Forms.DialogResult.OK;
            OkButton.Location = new System.Drawing.Point(0, 406);
            OkButton.Name = "OkButton";
            OkButton.Size = new System.Drawing.Size(800, 44);
            OkButton.TabIndex = 1;
            OkButton.Text = "&Done";
            OkButton.UseVisualStyleBackColor = true;
            // 
            // splitContainer1
            // 
            this.splitContainer1.Anchor = ((System.Windows.Forms.AnchorStyles)((((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom) 
            | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.splitContainer1.BorderStyle = System.Windows.Forms.BorderStyle.Fixed3D;
            this.splitContainer1.Location = new System.Drawing.Point(0, 0);
            this.splitContainer1.Name = "splitContainer1";
            // 
            // splitContainer1.Panel1
            // 
            this.splitContainer1.Panel1.Controls.Add(this.CharactersList);
            this.splitContainer1.Panel1.Controls.Add(this.flowLayoutPanel1);
            // 
            // splitContainer1.Panel2
            // 
            this.splitContainer1.Panel2.Controls.Add(this.TextBox);
            this.splitContainer1.Size = new System.Drawing.Size(800, 400);
            this.splitContainer1.SplitterDistance = 300;
            this.splitContainer1.TabIndex = 0;
            // 
            // CharactersList
            // 
            this.CharactersList.Anchor = ((System.Windows.Forms.AnchorStyles)((((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom) 
            | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.CharactersList.FormattingEnabled = true;
            this.CharactersList.Location = new System.Drawing.Point(-2, 0);
            this.CharactersList.Name = "CharactersList";
            this.CharactersList.Size = new System.Drawing.Size(252, 394);
            this.CharactersList.TabIndex = 2;
            this.CharactersList.ItemCheck += new System.Windows.Forms.ItemCheckEventHandler(this.CharactersList_ItemCheck);
            this.CharactersList.SelectedIndexChanged += new System.EventHandler(this.CharactersList_SelectedIndexChanged);
            // 
            // flowLayoutPanel1
            // 
            this.flowLayoutPanel1.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Right)));
            this.flowLayoutPanel1.Controls.Add(this.MoveCharacterUpButton);
            this.flowLayoutPanel1.Controls.Add(this.MoveCharacterDownButton);
            this.flowLayoutPanel1.Location = new System.Drawing.Point(253, 4);
            this.flowLayoutPanel1.Name = "flowLayoutPanel1";
            this.flowLayoutPanel1.Size = new System.Drawing.Size(40, 378);
            this.flowLayoutPanel1.TabIndex = 1;
            // 
            // MoveCharacterUpButton
            // 
            this.MoveCharacterUpButton.Location = new System.Drawing.Point(3, 3);
            this.MoveCharacterUpButton.Name = "MoveCharacterUpButton";
            this.MoveCharacterUpButton.Size = new System.Drawing.Size(34, 23);
            this.MoveCharacterUpButton.TabIndex = 0;
            this.MoveCharacterUpButton.Text = "/\\";
            this.MoveCharacterUpButton.UseVisualStyleBackColor = true;
            this.MoveCharacterUpButton.Click += new System.EventHandler(this.MoveCharacterUpButton_Click);
            // 
            // MoveCharacterDownButton
            // 
            this.MoveCharacterDownButton.Location = new System.Drawing.Point(3, 32);
            this.MoveCharacterDownButton.Name = "MoveCharacterDownButton";
            this.MoveCharacterDownButton.Size = new System.Drawing.Size(34, 23);
            this.MoveCharacterDownButton.TabIndex = 1;
            this.MoveCharacterDownButton.Text = "\\/";
            this.MoveCharacterDownButton.UseVisualStyleBackColor = true;
            this.MoveCharacterDownButton.Click += new System.EventHandler(this.MoveCharacterDownButton_Click);
            // 
            // TextBox
            // 
            this.TextBox.Dock = System.Windows.Forms.DockStyle.Fill;
            this.TextBox.Location = new System.Drawing.Point(0, 0);
            this.TextBox.Multiline = true;
            this.TextBox.Name = "TextBox";
            this.TextBox.Size = new System.Drawing.Size(492, 396);
            this.TextBox.TabIndex = 0;
            this.TextBox.TextChanged += new System.EventHandler(this.TextBox_TextChanged);
            // 
            // NightOrderForm
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(800, 450);
            this.Controls.Add(OkButton);
            this.Controls.Add(this.splitContainer1);
            this.Name = "NightOrderForm";
            this.Text = "NightOrderForm";
            this.splitContainer1.Panel1.ResumeLayout(false);
            this.splitContainer1.Panel2.ResumeLayout(false);
            this.splitContainer1.Panel2.PerformLayout();
            ((System.ComponentModel.ISupportInitialize)(this.splitContainer1)).EndInit();
            this.splitContainer1.ResumeLayout(false);
            this.flowLayoutPanel1.ResumeLayout(false);
            this.ResumeLayout(false);

        }

        #endregion

        private System.Windows.Forms.SplitContainer splitContainer1;
        private System.Windows.Forms.TextBox TextBox;
        private System.Windows.Forms.FlowLayoutPanel flowLayoutPanel1;
        private System.Windows.Forms.Button MoveCharacterUpButton;
        private System.Windows.Forms.Button MoveCharacterDownButton;
        private System.Windows.Forms.CheckedListBox CharactersList;
    }
}