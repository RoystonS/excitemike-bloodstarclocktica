
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
            System.Windows.Forms.Label label1;
            System.Windows.Forms.Label lbl;
            this.splitContainer1 = new System.Windows.Forms.SplitContainer();
            this.flowLayoutPanel1 = new System.Windows.Forms.FlowLayoutPanel();
            this.MoveCharacterUpButton = new System.Windows.Forms.Button();
            this.MoveCharacterDownButton = new System.Windows.Forms.Button();
            this.CharactersList = new System.Windows.Forms.CheckedListBox();
            this.tableLayoutPanel1 = new System.Windows.Forms.TableLayoutPanel();
            this.NightReminderLabel = new System.Windows.Forms.Label();
            this.TextBox = new System.Windows.Forms.TextBox();
            this.AbilityText = new System.Windows.Forms.TextBox();
            this.TeamText = new System.Windows.Forms.TextBox();
            OkButton = new System.Windows.Forms.Button();
            label1 = new System.Windows.Forms.Label();
            lbl = new System.Windows.Forms.Label();
            ((System.ComponentModel.ISupportInitialize)(this.splitContainer1)).BeginInit();
            this.splitContainer1.Panel1.SuspendLayout();
            this.splitContainer1.Panel2.SuspendLayout();
            this.splitContainer1.SuspendLayout();
            this.flowLayoutPanel1.SuspendLayout();
            this.tableLayoutPanel1.SuspendLayout();
            this.SuspendLayout();
            // 
            // OkButton
            // 
            OkButton.Anchor = ((System.Windows.Forms.AnchorStyles)(((System.Windows.Forms.AnchorStyles.Bottom | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            OkButton.DialogResult = System.Windows.Forms.DialogResult.OK;
            OkButton.Location = new System.Drawing.Point(0, 417);
            OkButton.Name = "OkButton";
            OkButton.Size = new System.Drawing.Size(684, 44);
            OkButton.TabIndex = 1;
            OkButton.Text = "&Done";
            OkButton.UseVisualStyleBackColor = true;
            // 
            // label1
            // 
            label1.Anchor = ((System.Windows.Forms.AnchorStyles)(((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom) 
            | System.Windows.Forms.AnchorStyles.Right)));
            label1.AutoSize = true;
            label1.Location = new System.Drawing.Point(49, 0);
            label1.Name = "label1";
            label1.Size = new System.Drawing.Size(34, 25);
            label1.TabIndex = 2;
            label1.Text = "Team";
            label1.TextAlign = System.Drawing.ContentAlignment.MiddleRight;
            // 
            // lbl
            // 
            lbl.Anchor = ((System.Windows.Forms.AnchorStyles)(((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom) 
            | System.Windows.Forms.AnchorStyles.Right)));
            lbl.AutoSize = true;
            lbl.Location = new System.Drawing.Point(49, 25);
            lbl.Name = "lbl";
            lbl.Size = new System.Drawing.Size(34, 50);
            lbl.TabIndex = 3;
            lbl.Text = "Ability";
            lbl.TextAlign = System.Drawing.ContentAlignment.MiddleRight;
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
            this.splitContainer1.Panel1.Controls.Add(this.flowLayoutPanel1);
            this.splitContainer1.Panel1.Controls.Add(this.CharactersList);
            // 
            // splitContainer1.Panel2
            // 
            this.splitContainer1.Panel2.Controls.Add(this.tableLayoutPanel1);
            this.splitContainer1.Size = new System.Drawing.Size(684, 411);
            this.splitContainer1.SplitterDistance = 316;
            this.splitContainer1.TabIndex = 0;
            // 
            // flowLayoutPanel1
            // 
            this.flowLayoutPanel1.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Right)));
            this.flowLayoutPanel1.Controls.Add(this.MoveCharacterUpButton);
            this.flowLayoutPanel1.Controls.Add(this.MoveCharacterDownButton);
            this.flowLayoutPanel1.Location = new System.Drawing.Point(269, 3);
            this.flowLayoutPanel1.Name = "flowLayoutPanel1";
            this.flowLayoutPanel1.Size = new System.Drawing.Size(40, 304);
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
            // CharactersList
            // 
            this.CharactersList.Anchor = ((System.Windows.Forms.AnchorStyles)((((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom) 
            | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.CharactersList.FormattingEnabled = true;
            this.CharactersList.Location = new System.Drawing.Point(3, 3);
            this.CharactersList.Name = "CharactersList";
            this.CharactersList.Size = new System.Drawing.Size(260, 394);
            this.CharactersList.TabIndex = 2;
            this.CharactersList.ItemCheck += new System.Windows.Forms.ItemCheckEventHandler(this.CharactersList_ItemCheck);
            this.CharactersList.SelectedIndexChanged += new System.EventHandler(this.CharactersList_SelectedIndexChanged);
            // 
            // tableLayoutPanel1
            // 
            this.tableLayoutPanel1.Anchor = ((System.Windows.Forms.AnchorStyles)((((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom) 
            | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.tableLayoutPanel1.ColumnCount = 2;
            this.tableLayoutPanel1.ColumnStyles.Add(new System.Windows.Forms.ColumnStyle());
            this.tableLayoutPanel1.ColumnStyles.Add(new System.Windows.Forms.ColumnStyle(System.Windows.Forms.SizeType.Percent, 100F));
            this.tableLayoutPanel1.Controls.Add(label1, 0, 0);
            this.tableLayoutPanel1.Controls.Add(lbl, 0, 1);
            this.tableLayoutPanel1.Controls.Add(this.NightReminderLabel, 0, 2);
            this.tableLayoutPanel1.Controls.Add(this.TextBox, 1, 2);
            this.tableLayoutPanel1.Controls.Add(this.AbilityText, 1, 1);
            this.tableLayoutPanel1.Controls.Add(this.TeamText, 1, 0);
            this.tableLayoutPanel1.Location = new System.Drawing.Point(3, 3);
            this.tableLayoutPanel1.Name = "tableLayoutPanel1";
            this.tableLayoutPanel1.RowCount = 3;
            this.tableLayoutPanel1.RowStyles.Add(new System.Windows.Forms.RowStyle(System.Windows.Forms.SizeType.Absolute, 25F));
            this.tableLayoutPanel1.RowStyles.Add(new System.Windows.Forms.RowStyle(System.Windows.Forms.SizeType.Absolute, 50F));
            this.tableLayoutPanel1.RowStyles.Add(new System.Windows.Forms.RowStyle(System.Windows.Forms.SizeType.Percent, 100F));
            this.tableLayoutPanel1.RowStyles.Add(new System.Windows.Forms.RowStyle(System.Windows.Forms.SizeType.Absolute, 20F));
            this.tableLayoutPanel1.Size = new System.Drawing.Size(354, 204);
            this.tableLayoutPanel1.TabIndex = 2;
            // 
            // NightReminderLabel
            // 
            this.NightReminderLabel.Anchor = ((System.Windows.Forms.AnchorStyles)(((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.NightReminderLabel.AutoSize = true;
            this.NightReminderLabel.Location = new System.Drawing.Point(3, 75);
            this.NightReminderLabel.Name = "NightReminderLabel";
            this.NightReminderLabel.Size = new System.Drawing.Size(80, 129);
            this.NightReminderLabel.TabIndex = 4;
            this.NightReminderLabel.Text = "Night Reminder";
            this.NightReminderLabel.TextAlign = System.Drawing.ContentAlignment.MiddleRight;
            // 
            // TextBox
            // 
            this.TextBox.Anchor = ((System.Windows.Forms.AnchorStyles)((((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom) 
            | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.TextBox.Location = new System.Drawing.Point(89, 78);
            this.TextBox.Multiline = true;
            this.TextBox.Name = "TextBox";
            this.TextBox.Size = new System.Drawing.Size(262, 123);
            this.TextBox.TabIndex = 0;
            this.TextBox.TextChanged += new System.EventHandler(this.TextBox_TextChanged);
            // 
            // AbilityText
            // 
            this.AbilityText.Dock = System.Windows.Forms.DockStyle.Fill;
            this.AbilityText.Location = new System.Drawing.Point(89, 28);
            this.AbilityText.Multiline = true;
            this.AbilityText.Name = "AbilityText";
            this.AbilityText.ReadOnly = true;
            this.AbilityText.Size = new System.Drawing.Size(262, 44);
            this.AbilityText.TabIndex = 6;
            // 
            // TeamText
            // 
            this.TeamText.Dock = System.Windows.Forms.DockStyle.Fill;
            this.TeamText.Location = new System.Drawing.Point(89, 3);
            this.TeamText.Multiline = true;
            this.TeamText.Name = "TeamText";
            this.TeamText.ReadOnly = true;
            this.TeamText.Size = new System.Drawing.Size(262, 19);
            this.TeamText.TabIndex = 7;
            // 
            // NightOrderForm
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(684, 461);
            this.Controls.Add(OkButton);
            this.Controls.Add(this.splitContainer1);
            this.Name = "NightOrderForm";
            this.ShowIcon = false;
            this.Text = "NightOrderForm";
            this.splitContainer1.Panel1.ResumeLayout(false);
            this.splitContainer1.Panel2.ResumeLayout(false);
            ((System.ComponentModel.ISupportInitialize)(this.splitContainer1)).EndInit();
            this.splitContainer1.ResumeLayout(false);
            this.flowLayoutPanel1.ResumeLayout(false);
            this.tableLayoutPanel1.ResumeLayout(false);
            this.tableLayoutPanel1.PerformLayout();
            this.ResumeLayout(false);

        }

        #endregion

        private System.Windows.Forms.SplitContainer splitContainer1;
        private System.Windows.Forms.TextBox TextBox;
        private System.Windows.Forms.FlowLayoutPanel flowLayoutPanel1;
        private System.Windows.Forms.Button MoveCharacterUpButton;
        private System.Windows.Forms.Button MoveCharacterDownButton;
        private System.Windows.Forms.CheckedListBox CharactersList;
        private System.Windows.Forms.TableLayoutPanel tableLayoutPanel1;
        private System.Windows.Forms.Label NightReminderLabel;
        private System.Windows.Forms.TextBox AbilityText;
        private System.Windows.Forms.TextBox TeamText;
    }
}