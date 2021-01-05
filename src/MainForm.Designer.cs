
namespace BloodstarClocktica
{
    partial class MainForm
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
            System.Windows.Forms.SplitContainer splitContainer2;
            System.Windows.Forms.TableLayoutPanel tableLayoutPanel2;
            System.Windows.Forms.GroupBox groupBox2;
            this.CharactersList = new System.Windows.Forms.ListBox();
            this.flowLayoutPanel1 = new System.Windows.Forms.FlowLayoutPanel();
            this.MoveCharacterUpButton = new System.Windows.Forms.Button();
            this.MoveCharacterDownButton = new System.Windows.Forms.Button();
            this.AddCharacterButton = new System.Windows.Forms.Button();
            this.RemoveCharacterButton = new System.Windows.Forms.Button();
            this.ProcessedImageGroupBox = new System.Windows.Forms.GroupBox();
            this.ProcessedImagePanel = new System.Windows.Forms.Panel();
            this.SourceImageButton = new System.Windows.Forms.Button();
            this.PropertyGrid = new System.Windows.Forms.PropertyGrid();
            this.fileMenu = new System.Windows.Forms.ToolStripMenuItem();
            this.newToolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
            this.openToolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
            this.saveToolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
            this.saveAsToolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
            this.orderToolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
            this.firstNightToolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
            this.otherNightsToolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
            this.exportToolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
            this.toDiskToolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
            this.uploadToolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
            this.SplitContainer = new System.Windows.Forms.SplitContainer();
            this.tableLayoutPanel1 = new System.Windows.Forms.TableLayoutPanel();
            this.AuthorTextBox = new System.Windows.Forms.TextBox();
            this.label1 = new System.Windows.Forms.Label();
            this.label2 = new System.Windows.Forms.Label();
            this.label3 = new System.Windows.Forms.Label();
            this.LogoButton = new System.Windows.Forms.Button();
            this.NameTextBox = new System.Windows.Forms.TextBox();
            this.menuStrip1 = new System.Windows.Forms.MenuStrip();
            groupBox1 = new System.Windows.Forms.GroupBox();
            splitContainer2 = new System.Windows.Forms.SplitContainer();
            tableLayoutPanel2 = new System.Windows.Forms.TableLayoutPanel();
            groupBox2 = new System.Windows.Forms.GroupBox();
            groupBox1.SuspendLayout();
            this.flowLayoutPanel1.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)(splitContainer2)).BeginInit();
            splitContainer2.Panel1.SuspendLayout();
            splitContainer2.Panel2.SuspendLayout();
            splitContainer2.SuspendLayout();
            tableLayoutPanel2.SuspendLayout();
            this.ProcessedImageGroupBox.SuspendLayout();
            groupBox2.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)(this.SplitContainer)).BeginInit();
            this.SplitContainer.Panel1.SuspendLayout();
            this.SplitContainer.Panel2.SuspendLayout();
            this.SplitContainer.SuspendLayout();
            this.tableLayoutPanel1.SuspendLayout();
            this.menuStrip1.SuspendLayout();
            this.SuspendLayout();
            // 
            // groupBox1
            // 
            groupBox1.Anchor = ((System.Windows.Forms.AnchorStyles)((((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom) 
            | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            groupBox1.Controls.Add(this.CharactersList);
            groupBox1.Controls.Add(this.flowLayoutPanel1);
            groupBox1.Location = new System.Drawing.Point(4, 165);
            groupBox1.Name = "groupBox1";
            groupBox1.Size = new System.Drawing.Size(255, 465);
            groupBox1.TabIndex = 7;
            groupBox1.TabStop = false;
            groupBox1.Text = "Characters";
            // 
            // CharactersList
            // 
            this.CharactersList.Anchor = ((System.Windows.Forms.AnchorStyles)((((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom) 
            | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.CharactersList.FormattingEnabled = true;
            this.CharactersList.Location = new System.Drawing.Point(5, 23);
            this.CharactersList.Name = "CharactersList";
            this.CharactersList.Size = new System.Drawing.Size(204, 433);
            this.CharactersList.TabIndex = 5;
            this.CharactersList.SelectedIndexChanged += new System.EventHandler(this.CharactersList_SelectedIndexChanged);
            // 
            // flowLayoutPanel1
            // 
            this.flowLayoutPanel1.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Right)));
            this.flowLayoutPanel1.Controls.Add(this.MoveCharacterUpButton);
            this.flowLayoutPanel1.Controls.Add(this.MoveCharacterDownButton);
            this.flowLayoutPanel1.Controls.Add(this.AddCharacterButton);
            this.flowLayoutPanel1.Controls.Add(this.RemoveCharacterButton);
            this.flowLayoutPanel1.FlowDirection = System.Windows.Forms.FlowDirection.RightToLeft;
            this.flowLayoutPanel1.Location = new System.Drawing.Point(212, 19);
            this.flowLayoutPanel1.Name = "flowLayoutPanel1";
            this.flowLayoutPanel1.Size = new System.Drawing.Size(40, 269);
            this.flowLayoutPanel1.TabIndex = 6;
            // 
            // MoveCharacterUpButton
            // 
            this.MoveCharacterUpButton.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Right)));
            this.MoveCharacterUpButton.Location = new System.Drawing.Point(3, 3);
            this.MoveCharacterUpButton.Name = "MoveCharacterUpButton";
            this.MoveCharacterUpButton.Size = new System.Drawing.Size(34, 23);
            this.MoveCharacterUpButton.TabIndex = 2;
            this.MoveCharacterUpButton.Text = "/\\";
            this.MoveCharacterUpButton.UseVisualStyleBackColor = true;
            this.MoveCharacterUpButton.Click += new System.EventHandler(this.MoveCharacterUpButton_Click);
            // 
            // MoveCharacterDownButton
            // 
            this.MoveCharacterDownButton.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Right)));
            this.MoveCharacterDownButton.Location = new System.Drawing.Point(3, 32);
            this.MoveCharacterDownButton.Name = "MoveCharacterDownButton";
            this.MoveCharacterDownButton.Size = new System.Drawing.Size(34, 23);
            this.MoveCharacterDownButton.TabIndex = 3;
            this.MoveCharacterDownButton.Text = "\\/";
            this.MoveCharacterDownButton.UseVisualStyleBackColor = true;
            this.MoveCharacterDownButton.Click += new System.EventHandler(this.MoveCharacterDownButton_Click);
            // 
            // AddCharacterButton
            // 
            this.AddCharacterButton.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Right)));
            this.AddCharacterButton.Location = new System.Drawing.Point(3, 61);
            this.AddCharacterButton.Name = "AddCharacterButton";
            this.AddCharacterButton.Size = new System.Drawing.Size(34, 23);
            this.AddCharacterButton.TabIndex = 4;
            this.AddCharacterButton.Text = "Add";
            this.AddCharacterButton.UseVisualStyleBackColor = true;
            this.AddCharacterButton.Click += new System.EventHandler(this.AddCharacter_Click);
            // 
            // RemoveCharacterButton
            // 
            this.RemoveCharacterButton.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Right)));
            this.RemoveCharacterButton.Location = new System.Drawing.Point(3, 90);
            this.RemoveCharacterButton.Name = "RemoveCharacterButton";
            this.RemoveCharacterButton.Size = new System.Drawing.Size(34, 23);
            this.RemoveCharacterButton.TabIndex = 5;
            this.RemoveCharacterButton.Text = "Del";
            this.RemoveCharacterButton.UseVisualStyleBackColor = true;
            this.RemoveCharacterButton.Click += new System.EventHandler(this.RemoveCharacter_Click);
            // 
            // splitContainer2
            // 
            splitContainer2.BorderStyle = System.Windows.Forms.BorderStyle.Fixed3D;
            splitContainer2.Dock = System.Windows.Forms.DockStyle.Fill;
            splitContainer2.Location = new System.Drawing.Point(0, 0);
            splitContainer2.Name = "splitContainer2";
            splitContainer2.Orientation = System.Windows.Forms.Orientation.Horizontal;
            // 
            // splitContainer2.Panel1
            // 
            splitContainer2.Panel1.Controls.Add(tableLayoutPanel2);
            // 
            // splitContainer2.Panel2
            // 
            splitContainer2.Panel2.Controls.Add(this.PropertyGrid);
            splitContainer2.Size = new System.Drawing.Size(714, 637);
            splitContainer2.SplitterDistance = 313;
            splitContainer2.TabIndex = 1;
            // 
            // tableLayoutPanel2
            // 
            tableLayoutPanel2.ColumnCount = 2;
            tableLayoutPanel2.ColumnStyles.Add(new System.Windows.Forms.ColumnStyle(System.Windows.Forms.SizeType.Percent, 50F));
            tableLayoutPanel2.ColumnStyles.Add(new System.Windows.Forms.ColumnStyle(System.Windows.Forms.SizeType.Percent, 50F));
            tableLayoutPanel2.Controls.Add(this.ProcessedImageGroupBox, 0, 0);
            tableLayoutPanel2.Controls.Add(groupBox2, 0, 0);
            tableLayoutPanel2.Dock = System.Windows.Forms.DockStyle.Fill;
            tableLayoutPanel2.Location = new System.Drawing.Point(0, 0);
            tableLayoutPanel2.Name = "tableLayoutPanel2";
            tableLayoutPanel2.RowCount = 1;
            tableLayoutPanel2.RowStyles.Add(new System.Windows.Forms.RowStyle(System.Windows.Forms.SizeType.Percent, 50F));
            tableLayoutPanel2.Size = new System.Drawing.Size(710, 309);
            tableLayoutPanel2.TabIndex = 0;
            // 
            // ProcessedImageGroupBox
            // 
            this.ProcessedImageGroupBox.BackgroundImageLayout = System.Windows.Forms.ImageLayout.Zoom;
            this.ProcessedImageGroupBox.Controls.Add(this.ProcessedImagePanel);
            this.ProcessedImageGroupBox.Dock = System.Windows.Forms.DockStyle.Fill;
            this.ProcessedImageGroupBox.Location = new System.Drawing.Point(358, 3);
            this.ProcessedImageGroupBox.Name = "ProcessedImageGroupBox";
            this.ProcessedImageGroupBox.Size = new System.Drawing.Size(349, 303);
            this.ProcessedImageGroupBox.TabIndex = 2;
            this.ProcessedImageGroupBox.TabStop = false;
            this.ProcessedImageGroupBox.Text = "Processed Image";
            // 
            // ProcessedImagePanel
            // 
            this.ProcessedImagePanel.BackgroundImageLayout = System.Windows.Forms.ImageLayout.Zoom;
            this.ProcessedImagePanel.Dock = System.Windows.Forms.DockStyle.Fill;
            this.ProcessedImagePanel.Location = new System.Drawing.Point(3, 16);
            this.ProcessedImagePanel.Name = "ProcessedImagePanel";
            this.ProcessedImagePanel.Size = new System.Drawing.Size(343, 284);
            this.ProcessedImagePanel.TabIndex = 0;
            // 
            // groupBox2
            // 
            groupBox2.Controls.Add(this.SourceImageButton);
            groupBox2.Dock = System.Windows.Forms.DockStyle.Fill;
            groupBox2.Location = new System.Drawing.Point(3, 3);
            groupBox2.Name = "groupBox2";
            groupBox2.Size = new System.Drawing.Size(349, 303);
            groupBox2.TabIndex = 1;
            groupBox2.TabStop = false;
            groupBox2.Text = "Source Image";
            // 
            // SourceImageButton
            // 
            this.SourceImageButton.BackgroundImageLayout = System.Windows.Forms.ImageLayout.Zoom;
            this.SourceImageButton.Dock = System.Windows.Forms.DockStyle.Fill;
            this.SourceImageButton.Location = new System.Drawing.Point(3, 16);
            this.SourceImageButton.Name = "SourceImageButton";
            this.SourceImageButton.Size = new System.Drawing.Size(343, 284);
            this.SourceImageButton.TabIndex = 0;
            this.SourceImageButton.UseVisualStyleBackColor = true;
            this.SourceImageButton.Click += new System.EventHandler(this.SourceImageButton_Click);
            // 
            // PropertyGrid
            // 
            this.PropertyGrid.Dock = System.Windows.Forms.DockStyle.Fill;
            this.PropertyGrid.Location = new System.Drawing.Point(0, 0);
            this.PropertyGrid.Name = "PropertyGrid";
            this.PropertyGrid.Size = new System.Drawing.Size(710, 316);
            this.PropertyGrid.TabIndex = 0;
            this.PropertyGrid.PropertyValueChanged += new System.Windows.Forms.PropertyValueChangedEventHandler(this.PropertyGrid_PropertyValueChanged);
            // 
            // fileMenu
            // 
            this.fileMenu.DropDownItems.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.newToolStripMenuItem,
            this.openToolStripMenuItem,
            this.saveToolStripMenuItem,
            this.saveAsToolStripMenuItem});
            this.fileMenu.Name = "fileMenu";
            this.fileMenu.Size = new System.Drawing.Size(37, 20);
            this.fileMenu.Text = "&File";
            // 
            // newToolStripMenuItem
            // 
            this.newToolStripMenuItem.Name = "newToolStripMenuItem";
            this.newToolStripMenuItem.ShortcutKeys = ((System.Windows.Forms.Keys)((System.Windows.Forms.Keys.Control | System.Windows.Forms.Keys.N)));
            this.newToolStripMenuItem.Size = new System.Drawing.Size(156, 22);
            this.newToolStripMenuItem.Text = "&New";
            this.newToolStripMenuItem.Click += new System.EventHandler(this.NewToolStripMenuItem_Click);
            // 
            // openToolStripMenuItem
            // 
            this.openToolStripMenuItem.Name = "openToolStripMenuItem";
            this.openToolStripMenuItem.ShortcutKeys = ((System.Windows.Forms.Keys)((System.Windows.Forms.Keys.Control | System.Windows.Forms.Keys.O)));
            this.openToolStripMenuItem.Size = new System.Drawing.Size(156, 22);
            this.openToolStripMenuItem.Text = "&Open";
            this.openToolStripMenuItem.Click += new System.EventHandler(this.OpenToolStripMenuItem_Click);
            // 
            // saveToolStripMenuItem
            // 
            this.saveToolStripMenuItem.Name = "saveToolStripMenuItem";
            this.saveToolStripMenuItem.ShortcutKeys = ((System.Windows.Forms.Keys)((System.Windows.Forms.Keys.Control | System.Windows.Forms.Keys.S)));
            this.saveToolStripMenuItem.Size = new System.Drawing.Size(156, 22);
            this.saveToolStripMenuItem.Text = "&Save";
            this.saveToolStripMenuItem.Click += new System.EventHandler(this.SaveToolStripMenuItem_Click);
            // 
            // saveAsToolStripMenuItem
            // 
            this.saveAsToolStripMenuItem.Name = "saveAsToolStripMenuItem";
            this.saveAsToolStripMenuItem.ShortcutKeys = ((System.Windows.Forms.Keys)((System.Windows.Forms.Keys.Control | System.Windows.Forms.Keys.A)));
            this.saveAsToolStripMenuItem.Size = new System.Drawing.Size(156, 22);
            this.saveAsToolStripMenuItem.Text = "Save &As";
            this.saveAsToolStripMenuItem.Click += new System.EventHandler(this.SaveAsToolStripMenuItem_Click);
            // 
            // orderToolStripMenuItem
            // 
            this.orderToolStripMenuItem.DropDownItems.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.firstNightToolStripMenuItem,
            this.otherNightsToolStripMenuItem});
            this.orderToolStripMenuItem.Name = "orderToolStripMenuItem";
            this.orderToolStripMenuItem.Size = new System.Drawing.Size(49, 20);
            this.orderToolStripMenuItem.Text = "&Order";
            // 
            // firstNightToolStripMenuItem
            // 
            this.firstNightToolStripMenuItem.Name = "firstNightToolStripMenuItem";
            this.firstNightToolStripMenuItem.ShortcutKeys = ((System.Windows.Forms.Keys)((System.Windows.Forms.Keys.Control | System.Windows.Forms.Keys.D1)));
            this.firstNightToolStripMenuItem.Size = new System.Drawing.Size(182, 22);
            this.firstNightToolStripMenuItem.Text = "&First Night";
            this.firstNightToolStripMenuItem.Click += new System.EventHandler(this.FirstNightToolStripMenuItem_Click);
            // 
            // otherNightsToolStripMenuItem
            // 
            this.otherNightsToolStripMenuItem.Name = "otherNightsToolStripMenuItem";
            this.otherNightsToolStripMenuItem.ShortcutKeys = ((System.Windows.Forms.Keys)((System.Windows.Forms.Keys.Control | System.Windows.Forms.Keys.D2)));
            this.otherNightsToolStripMenuItem.Size = new System.Drawing.Size(182, 22);
            this.otherNightsToolStripMenuItem.Text = "&Other Nights";
            this.otherNightsToolStripMenuItem.Click += new System.EventHandler(this.OtherNightsToolStripMenuItem_Click);
            // 
            // exportToolStripMenuItem
            // 
            this.exportToolStripMenuItem.DropDownItems.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.toDiskToolStripMenuItem,
            this.uploadToolStripMenuItem});
            this.exportToolStripMenuItem.Name = "exportToolStripMenuItem";
            this.exportToolStripMenuItem.Size = new System.Drawing.Size(53, 20);
            this.exportToolStripMenuItem.Text = "&Export";
            // 
            // toDiskToolStripMenuItem
            // 
            this.toDiskToolStripMenuItem.Name = "toDiskToolStripMenuItem";
            this.toDiskToolStripMenuItem.ShortcutKeys = System.Windows.Forms.Keys.F5;
            this.toDiskToolStripMenuItem.Size = new System.Drawing.Size(180, 22);
            this.toDiskToolStripMenuItem.Text = "To &Disk";
            this.toDiskToolStripMenuItem.Click += new System.EventHandler(this.ToDiskToolStripMenuItem_Click);
            // 
            // uploadToolStripMenuItem
            // 
            this.uploadToolStripMenuItem.Name = "uploadToolStripMenuItem";
            this.uploadToolStripMenuItem.ShortcutKeys = ((System.Windows.Forms.Keys)((System.Windows.Forms.Keys.Control | System.Windows.Forms.Keys.F5)));
            this.uploadToolStripMenuItem.Size = new System.Drawing.Size(180, 22);
            this.uploadToolStripMenuItem.Text = "&Upload";
            // 
            // SplitContainer
            // 
            this.SplitContainer.BorderStyle = System.Windows.Forms.BorderStyle.Fixed3D;
            this.SplitContainer.Dock = System.Windows.Forms.DockStyle.Fill;
            this.SplitContainer.Location = new System.Drawing.Point(0, 24);
            this.SplitContainer.Name = "SplitContainer";
            // 
            // SplitContainer.Panel1
            // 
            this.SplitContainer.Panel1.Controls.Add(groupBox1);
            this.SplitContainer.Panel1.Controls.Add(this.tableLayoutPanel1);
            // 
            // SplitContainer.Panel2
            // 
            this.SplitContainer.Panel2.Controls.Add(splitContainer2);
            this.SplitContainer.Size = new System.Drawing.Size(984, 637);
            this.SplitContainer.SplitterDistance = 266;
            this.SplitContainer.TabIndex = 1;
            // 
            // tableLayoutPanel1
            // 
            this.tableLayoutPanel1.Anchor = ((System.Windows.Forms.AnchorStyles)(((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.tableLayoutPanel1.AutoSizeMode = System.Windows.Forms.AutoSizeMode.GrowAndShrink;
            this.tableLayoutPanel1.ColumnCount = 2;
            this.tableLayoutPanel1.ColumnStyles.Add(new System.Windows.Forms.ColumnStyle());
            this.tableLayoutPanel1.ColumnStyles.Add(new System.Windows.Forms.ColumnStyle(System.Windows.Forms.SizeType.Percent, 100F));
            this.tableLayoutPanel1.Controls.Add(this.AuthorTextBox, 1, 1);
            this.tableLayoutPanel1.Controls.Add(this.label1, 0, 0);
            this.tableLayoutPanel1.Controls.Add(this.label2, 0, 1);
            this.tableLayoutPanel1.Controls.Add(this.label3, 0, 2);
            this.tableLayoutPanel1.Controls.Add(this.LogoButton, 1, 2);
            this.tableLayoutPanel1.Controls.Add(this.NameTextBox, 1, 0);
            this.tableLayoutPanel1.Location = new System.Drawing.Point(3, 5);
            this.tableLayoutPanel1.Name = "tableLayoutPanel1";
            this.tableLayoutPanel1.RowCount = 3;
            this.tableLayoutPanel1.RowStyles.Add(new System.Windows.Forms.RowStyle(System.Windows.Forms.SizeType.Percent, 50F));
            this.tableLayoutPanel1.RowStyles.Add(new System.Windows.Forms.RowStyle(System.Windows.Forms.SizeType.Percent, 50F));
            this.tableLayoutPanel1.RowStyles.Add(new System.Windows.Forms.RowStyle(System.Windows.Forms.SizeType.Absolute, 100F));
            this.tableLayoutPanel1.Size = new System.Drawing.Size(256, 154);
            this.tableLayoutPanel1.TabIndex = 4;
            // 
            // AuthorTextBox
            // 
            this.AuthorTextBox.Dock = System.Windows.Forms.DockStyle.Fill;
            this.AuthorTextBox.Location = new System.Drawing.Point(47, 30);
            this.AuthorTextBox.Name = "AuthorTextBox";
            this.AuthorTextBox.Size = new System.Drawing.Size(206, 20);
            this.AuthorTextBox.TabIndex = 4;
            this.AuthorTextBox.TextChanged += new System.EventHandler(this.AuthorTextBox_TextChanged);
            // 
            // label1
            // 
            this.label1.Anchor = System.Windows.Forms.AnchorStyles.Right;
            this.label1.AutoSize = true;
            this.label1.Location = new System.Drawing.Point(6, 7);
            this.label1.Name = "label1";
            this.label1.Size = new System.Drawing.Size(35, 13);
            this.label1.TabIndex = 0;
            this.label1.Text = "Name";
            // 
            // label2
            // 
            this.label2.Anchor = System.Windows.Forms.AnchorStyles.Right;
            this.label2.AutoSize = true;
            this.label2.Location = new System.Drawing.Point(3, 34);
            this.label2.Name = "label2";
            this.label2.Size = new System.Drawing.Size(38, 13);
            this.label2.TabIndex = 1;
            this.label2.Text = "Author";
            // 
            // label3
            // 
            this.label3.Anchor = System.Windows.Forms.AnchorStyles.Right;
            this.label3.AutoSize = true;
            this.label3.Location = new System.Drawing.Point(10, 97);
            this.label3.Name = "label3";
            this.label3.Size = new System.Drawing.Size(31, 13);
            this.label3.TabIndex = 2;
            this.label3.Text = "Logo";
            // 
            // LogoButton
            // 
            this.LogoButton.Anchor = ((System.Windows.Forms.AnchorStyles)((((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom) 
            | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.LogoButton.BackgroundImageLayout = System.Windows.Forms.ImageLayout.Zoom;
            this.LogoButton.Location = new System.Drawing.Point(47, 57);
            this.LogoButton.Name = "LogoButton";
            this.LogoButton.Size = new System.Drawing.Size(206, 94);
            this.LogoButton.TabIndex = 5;
            this.LogoButton.UseVisualStyleBackColor = true;
            this.LogoButton.Click += new System.EventHandler(this.LogoButton_Click);
            // 
            // NameTextBox
            // 
            this.NameTextBox.Anchor = ((System.Windows.Forms.AnchorStyles)(((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.NameTextBox.Location = new System.Drawing.Point(47, 3);
            this.NameTextBox.Name = "NameTextBox";
            this.NameTextBox.Size = new System.Drawing.Size(206, 20);
            this.NameTextBox.TabIndex = 3;
            this.NameTextBox.TextChanged += new System.EventHandler(this.NameTextBox_TextChanged);
            // 
            // menuStrip1
            // 
            this.menuStrip1.Items.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.fileMenu,
            this.orderToolStripMenuItem,
            this.exportToolStripMenuItem});
            this.menuStrip1.Location = new System.Drawing.Point(0, 0);
            this.menuStrip1.Name = "menuStrip1";
            this.menuStrip1.Size = new System.Drawing.Size(984, 24);
            this.menuStrip1.TabIndex = 8;
            this.menuStrip1.Text = "menuStrip1";
            // 
            // MainForm
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(984, 661);
            this.Controls.Add(this.SplitContainer);
            this.Controls.Add(this.menuStrip1);
            this.MainMenuStrip = this.menuStrip1;
            this.Name = "MainForm";
            this.ShowIcon = false;
            this.StartPosition = System.Windows.Forms.FormStartPosition.CenterScreen;
            this.Text = "Bloodstar Clocktica";
            this.FormClosing += new System.Windows.Forms.FormClosingEventHandler(this.MainForm_FormClosing);
            groupBox1.ResumeLayout(false);
            this.flowLayoutPanel1.ResumeLayout(false);
            splitContainer2.Panel1.ResumeLayout(false);
            splitContainer2.Panel2.ResumeLayout(false);
            ((System.ComponentModel.ISupportInitialize)(splitContainer2)).EndInit();
            splitContainer2.ResumeLayout(false);
            tableLayoutPanel2.ResumeLayout(false);
            this.ProcessedImageGroupBox.ResumeLayout(false);
            groupBox2.ResumeLayout(false);
            this.SplitContainer.Panel1.ResumeLayout(false);
            this.SplitContainer.Panel2.ResumeLayout(false);
            ((System.ComponentModel.ISupportInitialize)(this.SplitContainer)).EndInit();
            this.SplitContainer.ResumeLayout(false);
            this.tableLayoutPanel1.ResumeLayout(false);
            this.tableLayoutPanel1.PerformLayout();
            this.menuStrip1.ResumeLayout(false);
            this.menuStrip1.PerformLayout();
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion
        private System.Windows.Forms.ToolStripMenuItem fileMenu;
        private System.Windows.Forms.ToolStripMenuItem newToolStripMenuItem;
        private System.Windows.Forms.ToolStripMenuItem openToolStripMenuItem;
        private System.Windows.Forms.ToolStripMenuItem saveToolStripMenuItem;
        private System.Windows.Forms.ToolStripMenuItem saveAsToolStripMenuItem;
        private System.Windows.Forms.ToolStripMenuItem exportToolStripMenuItem;
        private System.Windows.Forms.ToolStripMenuItem toDiskToolStripMenuItem;
        private System.Windows.Forms.ToolStripMenuItem uploadToolStripMenuItem;
        private System.Windows.Forms.FlowLayoutPanel flowLayoutPanel1;
        private System.Windows.Forms.Button MoveCharacterDownButton;
        private System.Windows.Forms.Button MoveCharacterUpButton;
        private System.Windows.Forms.Button AddCharacterButton;
        private System.Windows.Forms.Button RemoveCharacterButton;
        private System.Windows.Forms.TableLayoutPanel tableLayoutPanel1;
        private System.Windows.Forms.Label label1;
        private System.Windows.Forms.Label label2;
        private System.Windows.Forms.Label label3;
        private System.Windows.Forms.ToolStripMenuItem orderToolStripMenuItem;
        private System.Windows.Forms.ToolStripMenuItem firstNightToolStripMenuItem;
        private System.Windows.Forms.ToolStripMenuItem otherNightsToolStripMenuItem;
        public System.Windows.Forms.TextBox NameTextBox;
        public System.Windows.Forms.TextBox AuthorTextBox;
        public System.Windows.Forms.Button LogoButton;
        public System.Windows.Forms.ListBox CharactersList;
        private System.Windows.Forms.MenuStrip menuStrip1;
        public System.Windows.Forms.PropertyGrid PropertyGrid;
        public System.Windows.Forms.SplitContainer SplitContainer;
        public System.Windows.Forms.Button SourceImageButton;
        public System.Windows.Forms.Panel ProcessedImagePanel;
        private System.Windows.Forms.GroupBox ProcessedImageGroupBox;
    }
}

